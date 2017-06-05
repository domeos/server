package org.domeos.framework.api.model.overview;

/**
 * Created by junwuguo on 2017/2/27 0027.
 */
public class UsageOverview {
    private Integer projectCollection = null;
    private Integer project = null;
    private Integer deployCollection = null;
    private Integer deployment = null;
    private Integer image = null;
    private Integer imageBase = null;
    private Integer imageProject = null;
    private Integer imageOther = null;
    private Integer cluster = null;
    private Integer loadBalancerCollection = null;
    private Integer loadBalancerProxy = null;
    private Integer loadBalancerNginx = null;
    private Integer configurationCollection = null;
    private Integer configuration = null;

    public void merge(UsageOverview other) {
        this.projectCollection = (other.projectCollection == null ? this.projectCollection : other.projectCollection);
        this.project = (other.project == null ? this.project : other.project);
        this.deployCollection = (other.deployCollection == null ? this.deployCollection : other.deployCollection);
        this.deployment = (other.deployment == null ? this.deployment : other.deployment);
        this.image = (other.image == null ? this.image : other.image);
        this.imageBase = (other.imageBase == null ? this.imageBase : other.imageBase);
        this.imageProject = (other.imageProject == null ? this.imageProject : other.imageProject);
        this.imageOther = (other.imageOther == null ? this.imageOther : other.imageOther);
        this.cluster = (other.cluster == null ? this.cluster : other.cluster);
        this.loadBalancerCollection = (other.loadBalancerCollection == null ? this.loadBalancerCollection : other.loadBalancerCollection);
        this.loadBalancerProxy = (other.loadBalancerProxy == null ? this.loadBalancerProxy : other.loadBalancerProxy);
        this.loadBalancerNginx = (other.loadBalancerNginx == null ? this.loadBalancerNginx : other.loadBalancerNginx);
        this.configurationCollection = (other.configurationCollection == null ? this.configurationCollection : other.configurationCollection);
        this.configuration = (other.configuration == null ? this.configuration : other.configuration);
    }

    public Integer getProjectCollection() {
        return projectCollection;
    }

    public void setProjectCollection(Integer projectCollection) {
        this.projectCollection = projectCollection;
    }

    public Integer getProject() {
        return project;
    }

    public void setProject(Integer project) {
        this.project = project;
    }

    public Integer getDeployCollection() {
        return deployCollection;
    }

    public void setDeployCollection(Integer deployCollection) {
        this.deployCollection = deployCollection;
    }

    public Integer getDeployment() {
        return deployment;
    }

    public void setDeployment(Integer deployment) {
        this.deployment = deployment;
    }

    public Integer getImage() {
        return image;
    }

    public void setImage(Integer image) {
        this.image = image;
    }

    public Integer getImageBase() {
        return imageBase;
    }

    public void setImageBase(Integer imageBase) {
        this.imageBase = imageBase;
    }

    public Integer getImageProject() {
        return imageProject;
    }

    public void setImageProject(Integer imageProject) {
        this.imageProject = imageProject;
    }

    public Integer getImageOther() {
        return imageOther;
    }

    public void setImageOther(Integer imageOther) {
        this.imageOther = imageOther;
    }

    public Integer getCluster() {
        return cluster;
    }

    public void setCluster(Integer cluster) {
        this.cluster = cluster;
    }

    public Integer getLoadBalancerCollection() {
        return loadBalancerCollection;
    }

    public void setLoadBalancerCollection(Integer loadBalancerCollection) {
        this.loadBalancerCollection = loadBalancerCollection;
    }

    public Integer getLoadBalancerProxy() {
        return loadBalancerProxy;
    }

    public void setLoadBalancerProxy(Integer loadBalancerProxy) {
        this.loadBalancerProxy = loadBalancerProxy;
    }

    public Integer getLoadBalancerNginx() {
        return loadBalancerNginx;
    }

    public void setLoadBalancerNginx(Integer loadBalancerNginx) {
        this.loadBalancerNginx = loadBalancerNginx;
    }

    public Integer getConfigurationCollection() {
        return configurationCollection;
    }

    public void setConfigurationCollection(Integer configurationCollection) {
        this.configurationCollection = configurationCollection;
    }

    public Integer getConfiguration() {
        return configuration;
    }

    public void setConfiguration(Integer configuration) {
        this.configuration = configuration;
    }
}
