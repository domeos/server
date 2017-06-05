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
     * @param subject
     * @param sender
     * @return
     */
    HttpResponseTemp<?> sendSMS(String tos, String content, String subject, String sender);

    /**
     *
     * @param tos
     * @param content
     * @param subject
     * @param sender
     * @return
     */
    HttpResponseTemp<?> sendMail(String tos, String content, String subject, String sender);

    /**
     *
     * @param tos
     * @param content
     * @param subject
     * @param sender
     * @return
     */
    HttpResponseTemp<?> sendWechat(String tos, String content, String subject, String sender);
}
