package org.domeos.framework.api.service.alarm;

import org.domeos.basemodel.HttpResponseTemp;

/**
 * Created by baokangwang on 2016/5/6.
 */
public interface AlarmSenderService {

    /**
     *
     * @param tos
     * @param content
     * @return
     */
    HttpResponseTemp<?> sendSMS(String tos, String content);

    /**
     *
     * @param tos
     * @param content
     * @param subject
     * @return
     */
    HttpResponseTemp<?> sendMail(String tos, String content, String subject);
}
