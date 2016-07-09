package kmlk;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

/**
 * @website http://krotium.com
 *  @author DarkLBP
 */

public class Profile {
    private String name;
    private Version version = null;
    private File gameDir = null;
    private File javaDir = null;
    private String javaArgs = null;
    private Map<String, Integer> resolution = new HashMap();
    private final Versions versions;
    private LauncherVisibility visibility = null;
    
    public Profile(String name){
        this.name = name;
        this.versions = Kernel.getKernel().getVersions();
    }
    public Profile(String name, Version lastVersionId, File gameDir, File javaDir, String javaArgs, Map<String, Integer> resolution, LauncherVisibility v){
        this.name = name;
        this.version = lastVersionId;
        this.gameDir = gameDir;
        this.javaDir = javaDir;
        this.javaArgs = javaArgs;
        this.resolution = resolution;
        this.versions = Kernel.getKernel().getVersions();
        this.visibility = v;
    }
    public void setName(String newName){this.name = newName;}
    public void setVersion(Version ver){
        if (!ver.isPrepared()){
            ver.prepare();
        }
        ver.prepare();
        this.version = ver;
    }
    public String getName(){
        return this.name;
    }
    public Version getVersion(){
        if (!this.hasVersion()){
            return this.versions.getLatestVersion();
        }
        return this.version;
    }
    public boolean hasVersion(){return (this.version != null);}
    public File getGameDir(){return this.gameDir;}
    public boolean hasGameDir(){return (this.gameDir != null);}
    public void setGameDir(File dir){this.gameDir = dir;}
    public void setJavaDir(File dir){this.javaDir = dir;}
    public void setJavaArgs(String args){this.javaArgs = args;}
    public File getJavaDir(){return this.javaDir;}
    public boolean hasJavaDir(){return (this.javaDir != null);}
    public String getJavaArgs(){return this.javaArgs;}
    public boolean hasJavaArgs(){return (this.javaArgs != null);}
    public boolean hasResolution(){
        if (this.resolution != null){
            return (this.resolution.size() == 2);
        }
        return false;
    }
    public int getResolutionHeight(){
        if (resolution.containsKey("height")){
            return resolution.get("height");
        }
        return 0;
    }
    public int getResolutionWidth(){
        if (resolution.containsKey("width")){
            return resolution.get("width");
        }
        return 0;
    }
    public void setResolution(int w, int h){
        if (resolution == null){
            resolution = new HashMap();
        }
        resolution.put("width", w);
        resolution.put("height", h);
    }
    public boolean hasVisibility(){return (this.visibility != null);}
    public LauncherVisibility getVisibility(){return this.visibility;}
}
