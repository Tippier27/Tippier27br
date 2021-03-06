package kml;

import kml.objects.AssetIndex;
import kml.objects.Version;
import kml.objects.Library;
import java.io.File;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import kml.exceptions.DownloaderException;
import kml.objects.Downloadable;
import kml.objects.Profile;
import org.json.JSONObject;

/**
 * @website https://krothium.com
 * @author DarkLBP
 */

public class Downloader {
    private final Console console;
    private final Kernel kernel;
    private long downloaded = 0;
    private long validated = 0;
    private long total = 0;
    private boolean downloading = false;
    public Downloader(Kernel k){
        this.kernel = k;
        this.console = k.getConsole();
    }
    public void download() throws DownloaderException{
        this.downloading = true;
        Profile p = this.kernel.getProfile(this.kernel.getSelectedProfile());
        String verID = (p.hasVersion() ? p.getVersionID() : kernel.getLatestVersion());
        Version v = kernel.getVersion(verID);
        ExecutorService pool = Executors.newFixedThreadPool(5);
        List<Downloadable> urls = new ArrayList();
        this.downloaded = 0;
        this.validated = 0;
        this.total = 0;
        console.printInfo("Fetching asset urls..");
        if (v.hasAssetIndex()){
            AssetIndex index = v.getAssetIndex();
            String assetID = index.getID();
            long assetFileLength = index.getSize();
            boolean localIndex = false;
            File indexJSON = new File(kernel.getWorkingDir() + File.separator + index.getRelativeFile());
            URL assetsURL = null;
            if (indexJSON.exists() && indexJSON.isFile()){
                if (indexJSON.length() == assetFileLength){
                    try {
                        assetsURL = indexJSON.toURI().toURL();
                    } catch (MalformedURLException ex) {
                        this.downloading = false;
                        throw new DownloaderException("Invalid asset index json file path.");
                    }
                    localIndex = true;
                } 
            }
            assetsURL = (assetsURL == null) ? index.getURL() : assetsURL;
            if (!localIndex){
                int tries = 0;
                while (!Utils.downloadFile(assetsURL, indexJSON) && (tries < Constants.DOWNLOAD_TRIES)){
                    tries++;
                }
                if (tries == Constants.DOWNLOAD_TRIES){
                    console.printError("Failed to download asset index for version " + assetID);
                }
            }
            JSONObject root;
            try {
                root = new JSONObject(new String(Files.readAllBytes(indexJSON.toPath()), "ISO-8859-1"));
            } catch (UnsupportedEncodingException ex) {
                this.downloading = false;
                throw new DownloaderException("Your computer does not support ISO-8859-1 encoding.");
            } catch (IOException ex) {
                this.downloading = false;
                throw new DownloaderException("Failed to read asset index json file.");
            }
            JSONObject objects = root.getJSONObject("objects");
            Set keys = objects.keySet();
            Iterator it2 = keys.iterator();
            List<String> processedHashes = new ArrayList();
            while (it2.hasNext()){
                String object = it2.next().toString();
                JSONObject o = objects.getJSONObject(object);
                String hash = o.getString("hash");
                long size = o.getLong("size");
                URL downloadURL = Utils.stringToURL(Constants.RESOURCES_URL + hash.substring(0,2) + "/" + hash);
                File relPath = new File("assets" + File.separator + "objects" + File.separator + hash.substring(0,2) + File.separator + hash);
                File fullPath = new File(kernel.getWorkingDir() + File.separator + relPath);
                boolean localValid = false;
                if (fullPath.exists() && fullPath.isFile()){
                    if (fullPath.length() == size){
                        localValid = true;
                    }
                }
                this.total += size;
                if (!localValid){
                    Downloadable d = new Downloadable(downloadURL, size, relPath, hash);
                    urls.add(d);
                }else{
                    console.printInfo("Asset file " + object + " found locally and it is valid.");
                    if (!processedHashes.contains(hash)){
                        processedHashes.add(hash);
                        validated += size;
                    } else {
                        this.total -= size;
                    }
                }
            }
        } else {
            this.downloading = false;
            throw new DownloaderException("Version " + v.getID() + " does not have AssetIndex.");
        }
        console.printInfo("Fetching version urls..");
        Downloadable d = v.getClientDownload();
        if (d != null){
            if (d.hasURL()){
                long jarSize = d.getSize();
                String jarSHA1 = d.getHash();
                total += d.getSize();
                File destPath = new File(kernel.getWorkingDir() + File.separator + v.getRelativeJar());
                boolean localValid = false;
                File jsonFile = new File(kernel.getWorkingDir() + File.separator + v.getRelativeJSON());
                boolean JSONValid = false;
                if (jsonFile.exists() && jsonFile.isFile()){
                    try {
                        if (jsonFile.length() == jsonFile.toURI().toURL().openConnection().getContentLength()){
                            JSONValid = true;
                        }
                    } catch (IOException ex) {
                        console.printError("Falied to verify existing JSON integrity.");
                    }
                }
                if (!JSONValid){
                    int tries = 0;
                    while (!Utils.downloadFile(v.getJSONURL(), jsonFile) && (tries < Constants.DOWNLOAD_TRIES)){
                        tries++;
                    }
                    if (tries == Constants.DOWNLOAD_TRIES){
                        console.printError("Failed to download version index " + destPath.getName());
                    }
                }else{
                    console.printInfo("Version " + v.getID() + " JSON file found locally and it is valid.");
                }
                if (destPath.exists() && destPath.isFile()){
                    if (destPath.length() == jarSize && Utils.verifyChecksum(destPath, jarSHA1)){
                        localValid = true;
                    }
                }
                if (!localValid){
                    urls.add(d);
                }else{
                    console.printInfo("Version file " + destPath.getName() + " found locally and it is valid.");
                    validated += jarSize;
                }
            } else {
                console.printInfo("Incompatible version dowloadable.");
            }
        } else {
            console.printInfo("Version file from " + v.getID() + " has no compatible downloadable objects.");
        }
        console.printInfo("Fetching library and native urls..");
        List<Library> libs = v.getLibraries();
        for (Library lib : libs){
            if (lib.isCompatible()){
                if (lib.hasArtifactDownload()){
                    Downloadable a = lib.getArtifactDownload();
                    File completePath = new File(kernel.getWorkingDir() + File.separator + a.getRelativePath());
                    boolean valid = false;
                    if (completePath.exists()){
                        if (completePath.isFile()){
                            if (completePath.length() == a.getSize()){
                                valid = true;
                            }
                            if (a.hasHash() && valid){
                                valid = Utils.verifyChecksum(completePath, a.getHash());
                            }
                        }
                    }
                    if (!urls.contains(a) && !valid){
                        urls.add(a);
                    }
                }
                if (lib.hasClassifierDownload()){
                    Downloadable c = lib.getClassifierDownload();
                    File completePath = new File(kernel.getWorkingDir() + File.separator + c.getRelativePath());
                    boolean valid = false;
                    if (completePath.exists()){
                        if (completePath.isFile()){
                            if (completePath.length() == c.getSize()){
                                valid = true;
                            }
                            if (c.hasHash() && valid){
                                valid = Utils.verifyChecksum(completePath, c.getHash());
                            }
                        }
                    }
                    if (!urls.contains(c) && !valid){
                        urls.add(c);
                    }
                }
            }
        }
        console.printInfo("Downloading required game files...");
        if (urls.isEmpty()){
            console.printInfo("Nothing to download.");
        } else {
            for (final Downloadable dw : urls){
                Runnable thread = new Runnable(){
                    @Override
                    public void run(){
                        File path = dw.getRelativePath();
                        File fullPath = new File(kernel.getWorkingDir() + File.separator + path);
                        URL url = dw.getURL();
                        int tries = 0; 
                        console.printInfo("Downloading " + path.getName() + "...");
                        while (!Utils.downloadFile(url, fullPath) && (tries < Constants.DOWNLOAD_TRIES)){ 
                           tries++; 
                        } 
                        if (tries == Constants.DOWNLOAD_TRIES){ 
                            console.printError("Failed to download file: " + path.getName()); 
                        }
                        downloaded += dw.getSize();
                    }
                };
                pool.execute(thread);                
            }
            pool.shutdown();
            try{
                pool.awaitTermination(Long.MAX_VALUE, TimeUnit.NANOSECONDS);
            } catch (InterruptedException ex){
                this.downloading = false;
                throw new DownloaderException("Thread pool unexceptedly closed.");
            }
        }
        this.downloading = false;
    }
    public int getProgress(){
        if (!isDownloading()){
            return 0;
        }
        long sum = this.downloaded + this.validated;
        return (int)((float)(sum)/this.total*100);
    }
    public boolean isDownloading(){return this.downloading;}
}