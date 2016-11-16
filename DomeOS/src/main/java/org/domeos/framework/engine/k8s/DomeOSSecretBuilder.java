/**
 * 
 */
package org.domeos.framework.engine.k8s;

import io.fabric8.kubernetes.api.model.ObjectMeta;
import io.fabric8.kubernetes.api.model.Secret;

import java.util.HashMap;
import java.util.Map;

import io.fabric8.kubernetes.api.model.SecretBuilder;
import org.domeos.global.GlobalConstant;
import org.json.JSONException;

/**
 * @author jackfan
 * @date 2016年10月11日
 * @time 下午1:51:50
 */
public class DomeOSSecretBuilder {
    private String name;
    private String secretData;

    /**
     * @param name
     * @param secretData
     */
    public DomeOSSecretBuilder(String name, String secretData) {
        super();
        this.name = name;
        this.secretData = secretData;
    }

    public Secret build() throws JSONException {
        return buildSecret();
    }

    public Secret buildSecret() throws JSONException {
        Map<String, String> dataMap = new HashMap<>();
        dataMap.put(GlobalConstant.SECRET_DOCKERCFG_DATA_KEY, this.secretData);
        ObjectMeta objectMeta = new ObjectMeta();
        objectMeta.setName(this.name);

        return new SecretBuilder()
                .withType(GlobalConstant.SECRET_DOCKERCFG_TYPE)
                .withData(dataMap).withMetadata(objectMeta).build();
    }
}
