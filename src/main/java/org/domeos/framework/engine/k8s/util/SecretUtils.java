package org.domeos.framework.engine.k8s.util;

import org.apache.shiro.codec.Base64;
import org.domeos.framework.api.biz.global.GlobalBiz;
import org.domeos.framework.api.consolemodel.deployment.ContainerDraft;
import org.domeos.framework.api.model.global.Registry;
import org.domeos.global.GlobalConstant;
import org.domeos.util.StringUtils;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * @author jackfan
 * @date 2016年10月11日
 * @time 下午6:40:14
 */
@Component
public class SecretUtils {

    private static GlobalBiz globalBiz;

    @Autowired
    public void setGlobalBiz(GlobalBiz globalBiz) {
        SecretUtils.globalBiz = globalBiz;
    }

    public static boolean haveDomeOSRegistry(
            List<ContainerDraft> containerDrafts) {
        if (containerDrafts == null) {
            return false;
        }
        Registry registry = globalBiz.getRegistry();

        if (registry == null || registry.getTokenInfo() == null) {
            return false;
        }
        String registryUrl = registry.registryDomain();
        for (ContainerDraft container : containerDrafts) {
            if (!StringUtils.isBlank(container.getRegistry())
                    && container.getRegistry().contains(registryUrl)) {
                return true;
            }
        }
        return false;
    }

    public static String getDomeOSImageSecretData() throws JSONException {
        JSONObject json = new JSONObject();
        JSONObject jsonAuths = new JSONObject();
        JSONObject jsonAuth = new JSONObject();
        Registry registry = globalBiz.getRegistry();
        if (registry == null || registry.getTokenInfo() == null) {
            return "";
        }
        String registryUrl = registry.registryDomain();
        jsonAuth.put("auth", GlobalConstant.REGISTRY_TOKEN);
        jsonAuth.put("email", GlobalConstant.REGISTRY_EMAIL);
        jsonAuths.put(registryUrl, jsonAuth);
        json.put("auths", jsonAuths);

        return Base64.encodeToString(json.toString().getBytes());
    }
}
