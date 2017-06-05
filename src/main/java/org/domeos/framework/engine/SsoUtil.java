package org.domeos.framework.engine;

import org.domeos.framework.api.biz.global.GlobalBiz;
import org.domeos.framework.api.model.global.SsoInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Created by KaiRen on 2017/5/9.
 */
@Component
public class SsoUtil {
    private static GlobalBiz globalBiz;
    @Autowired
    public void setGlobalBiz(GlobalBiz globalBiz) {
        SsoUtil.globalBiz = globalBiz;
    }

    public static SsoInfo getSsoInfo() {
        return globalBiz.getSsoInfo();
    }
}
