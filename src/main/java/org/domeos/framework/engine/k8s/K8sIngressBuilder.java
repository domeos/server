package org.domeos.framework.engine.k8s;

import io.fabric8.kubernetes.api.model.IntOrString;
import io.fabric8.kubernetes.api.model.extensions.*;
import java.util.*;

import org.domeos.framework.api.model.loadBalancer.LoadBalancer;
import org.domeos.framework.api.model.loadBalancer.related.ForwardingRule;
import org.domeos.framework.api.model.loadBalancer.related.LoadBalancerType;
import org.domeos.global.GlobalConstant;


/**
 * Created by jackfan on 17/3/3.
 */
public class K8sIngressBuilder {
    private LoadBalancer lb;
    public K8sIngressBuilder(LoadBalancer lb) {
        this.lb = lb;
    }
    
    public Ingress build() {
        if (lb.getType() == LoadBalancerType.NGINX) {
            return buildIngress();
        } else {
            return null;
        }
    }
    private Ingress buildIngress() {
        Map<String, String> annotations = new HashMap<String, String>();
        annotations.put(GlobalConstant.INGRESS_ANNOTATION_KEY, 
                GlobalConstant.WITH_NEWLB_PREFIX + lb.getName());
        Ingress ingress = new IngressBuilder()
            .withNewMetadata()
            .withName(GlobalConstant.RC_NAME_PREFIX + lb.getName() + "-lb")
            .addToLabels(GlobalConstant.LOAD_BALANCER_ID_STR, String.valueOf(lb.getId()))
            .withNamespace(lb.getNamespace())
            .withAnnotations(annotations)
            .endMetadata()
            .build();
        
        IngressSpec spec = new IngressSpec();
        List<IngressRule> rules = new ArrayList<IngressRule>();
        for (ForwardingRule fdRule : lb.getNginxDraft().getRules()) {
            IngressRule rule = new IngressRule();
            rule.setHost(fdRule.getDomain());
            
            HTTPIngressRuleValue httpValue = new HTTPIngressRuleValue();
            List<HTTPIngressPath> httpPaths = new ArrayList<HTTPIngressPath>();
            HTTPIngressPath httpPath = new HTTPIngressPath();
            IngressBackend backend = new IngressBackend();
            backend.setServiceName(fdRule.getServiceName());
            backend.setServicePort(new IntOrString(fdRule.getServicePort()));
            httpPath.setBackend(backend);
            httpPaths.add(httpPath);
            httpValue.setPaths(httpPaths);
            rule.setHttp(httpValue);
            rules.add(rule);
        }
        spec.setRules(rules);
        ingress.setSpec(spec);
        return ingress;
    }
}
