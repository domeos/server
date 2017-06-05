package org.domeos.framework.api.consolemodel.loadBalancer;

import java.util.*;

import org.domeos.framework.api.consolemodel.deployment.*;
import org.domeos.framework.api.model.deployment.Version;
import org.domeos.framework.api.model.deployment.related.*;
import org.domeos.framework.api.model.loadBalancer.LoadBalancer;
import org.domeos.framework.api.model.loadBalancer.related.LoadBalancerMethod;
import org.domeos.global.GlobalConstant;
import org.domeos.util.StringUtils;

/**
 * Created by jackfan on 17/2/27.
 */
public class NginxVersionDraft {
    private int id;
    private int version = 0; //version id for the deploy, separate column
    private int listenPort;
    private List<String> externalIPs; //add node ip
    private String registry;
    private String image;
    private String tag;
    private LoadBalancerMethod lbMethod;
    private double cpu;
    private double mem;
    private List<LabelSelector> selectors; //test or product env
    private VolumeDraft volumeDraft;
    private int deployIdForLB;
    private long createTime = 0;
    private boolean deprecate = false;
    
    public NginxVersionDraft() {
        super();
    }

    public NginxVersionDraft(Version version) {
       List<ContainerDraft> containers = version.getContainerDrafts();
       if (containers != null) {
           ContainerDraft container = containers.get(0);
           List<EnvDraft> envs = container.getEnvs();
           if (envs != null) {
               for (EnvDraft env : envs) {
                   if (env.getKey().equals("LBMETHOD")) {
                       if (env.getValue() == null) {
                           this.lbMethod = LoadBalancerMethod.ROUNDROBIN;
                       } else {
                           this.lbMethod = LoadBalancerMethod.getEnumdByMethod(env.getValue());
                       }
                   }
                   if (env.getKey().equals("LISTENPORT")) {
                       this.listenPort = Integer.valueOf(env.getValue());
                   }
               }
           }
           this.registry = container.getRegistry();
           this.image = container.getImage();
           this.tag = container.getTag();
           this.mem = container.getMem();
           this.cpu = container.getCpu();
       }
       this.selectors = version.getLabelSelectors();
       List<VolumeDraft> volumes = version.getVolumeDrafts();
       if (volumes != null) {
           this.volumeDraft = volumes.get(0);
       }
       this.deployIdForLB = version.getDeployId();
       this.externalIPs = version.getHostList();
       this.id = version.getId();
       this.version = version.getVersion();
       this.createTime = version.getCreateTime();
       this.deprecate = version.isDeprecate();
    }
    
    public int getListenPort() {
        return listenPort;
    }
    
    public void setListenPort(int listenPort) {
        this.listenPort = listenPort;
    }
    
    public List<String> getExternalIPs() {
        return externalIPs;
    }

    public void setExternalIPs(List<String> externalIPs) {
        this.externalIPs = externalIPs;
    }

    public String getRegistry() {
        return registry;
    }
    
    public void setRegistry(String registry) {
        this.registry = registry;
    }
    
    public String getImage() {
        return image;
    }
    
    public void setImage(String image) {
        this.image = image;
    }
    
    public String getTag() {
        return tag;
    }
    
    public void setTag(String tag) {
        this.tag = tag;
    }
    
    public LoadBalancerMethod getLbMethod() {
        return lbMethod;
    }
    
    public void setLbMethod(LoadBalancerMethod lbMethod) {
        this.lbMethod = lbMethod;
    }
    
    public double getCpu() {
        return cpu;
    }
    
    public void setCpu(double cpu) {
        this.cpu = cpu;
    }
    
    public double getMem() {
        return mem;
    }
    
    public void setMem(double mem) {
        this.mem = mem;
    }
    
    public List<LabelSelector> getSelectors() {
        return selectors;
    }
    
    public void setSelectors(List<LabelSelector> selectors) {
        this.selectors = selectors;
    }
    
    public VolumeDraft getVolumeDraft() {
        return volumeDraft;
    }
    
    public void setVolumeDraft(VolumeDraft volumeDraft) {
        this.volumeDraft = volumeDraft;
    }
    
    public int getDeployIdForLB() {
        return deployIdForLB;
    }
    
    public void setDeployIdForLB(int deployIdForLB) {
        this.deployIdForLB = deployIdForLB;
    }
    
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getVersion() {
        return version;
    }

    public void setVersion(int version) {
        this.version = version;
    }
    
    public long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
    }
    
    public boolean isDeprecate() {
        return deprecate;
    }

    public void setDeprecate(boolean deprecate) {
        this.deprecate = deprecate;
    }

    public Version toVersion(String apiserver, LoadBalancer lb) {
        Version version = new Version();
        version.setHostList(this.getExternalIPs());
        version.setVersionType(VersionType.CUSTOM);
        version.setDeployId(this.deployIdForLB);
        version.setCreateTime(System.currentTimeMillis());
        
        List<ContainerDraft> containerDrafts = new LinkedList<ContainerDraft>();
        
        ContainerDraft nginxContainerDraft = new ContainerDraft();
        nginxContainerDraft.setRegistry(this.registry);
        nginxContainerDraft.setImage(this.image);
        nginxContainerDraft.setTag(this.tag);
        nginxContainerDraft.setCpu(this.cpu);
        nginxContainerDraft.setMem(this.mem);
        
        List<EnvDraft> nginxEnvDrafts = new LinkedList<>();
        nginxEnvDrafts.add(new EnvDraft("LBMETHOD", this.lbMethod.getMethod()));
        nginxEnvDrafts.add(new EnvDraft("LISTENPORT", String.valueOf(this.listenPort)));
        nginxContainerDraft.setEnvs(nginxEnvDrafts);
        List<String> args = new ArrayList<String>();
        args.add("/nginx-ingress-controller");
        args.add("--apiserver-host=" + apiserver);
        args.add("--watch-namespace=" + lb.getNamespace());
        args.add("--election-id=" + GlobalConstant.WITH_NEWLB_PREFIX + lb.getName());
        args.add("--ingress-class=" + GlobalConstant.WITH_NEWLB_PREFIX + lb.getName());
        nginxContainerDraft.setArgs(args);
        
        if(volumeDraft != null) {
            List<VolumeDraft> volumeDrafts = new LinkedList<VolumeDraft>();
            VolumeDraft volumeDraft = this.volumeDraft;
            volumeDraft.setName(GlobalConstant.RC_NAME_PREFIX + "log-volume");
            volumeDrafts.add(volumeDraft);
            List<VolumeMountDraft> volumeMountDrafts = new LinkedList<VolumeMountDraft>();
            VolumeMountDraft vmd = new VolumeMountDraft();
            vmd.setMountPath("/var/log/nginx/");
            vmd.setName(volumeDraft.getName());
            vmd.setReadOnly(false);
            volumeMountDrafts.add(vmd);
            nginxContainerDraft.setVolumeMountDrafts(volumeMountDrafts);
            version.setVolumeDrafts(volumeDrafts);
        }
        containerDrafts.add(nginxContainerDraft);
        List<LabelSelector> selectors = new ArrayList<LabelSelector>();
        selectors.addAll(this.selectors);
        LabelSelector selector = new LabelSelector();
        //for patch node label
        selector.setContent(GlobalConstant.LB_NODE_LABEL);
        selector.setName(GlobalConstant.WITH_NEWLB_PREFIX + lb.getNginxDraft().getDeployIdForLB() + "-" + lb.getName());
        selectors.add(selector);
        version.setLabelSelectors(selectors);
        version.setContainerDrafts(containerDrafts);
        return version;
    }
    
    public String checkLegality() {
        String error = "";
        if (listenPort < 1 || listenPort > 65535 ) {
            error += "listenPort range is 1~65535; ";
        }
        if (StringUtils.isBlank(image)) {
            error += "image is blank; ";
        }
        if (cpu < 0 || mem < 0) {
            error += "cpu or mem is negative; ";
        }
        if (StringUtils.isBlank(registry) || StringUtils.isBlank(image) 
                || StringUtils.isBlank(tag)) {
            error += "registry or image or tag is blank; ";
        }
        if (volumeDraft != null && volumeDraft.getVolumeType() == VolumeType.HOSTPATH) {
            if (StringUtils.isBlank(volumeDraft.getHostPath())) {
                    error += "host path must set for volume; ";
            }
        }
        if (selectors == null || selectors.size() == 0) {
            error += "must define test or product env; ";
        }
        if (externalIPs == null || externalIPs.size() == 0) {
            error += "externalIPs is blank; ";
        } else {
            Set<String> set = new HashSet<String>();
            set.addAll(externalIPs);
            if (set.size() != externalIPs.size()) {
                error += "externalIPs must be set different; ";
            }
        }
        if (deployIdForLB <= 0) {
            error += "deployIdForLB is less than 0; ";
        }
        return error;
    }
}
