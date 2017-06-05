package org.domeos.framework.api.service.alarm.impl;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.service.alarm.AlarmSenderService;
import org.domeos.framework.engine.groovy.GroovyLoadAndInvoke;
import org.domeos.util.EncodingTool;
import org.domeos.util.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import java.io.IOException;
import java.util.HashMap;

/**
 * Created by baokangwang on 2016/5/6.
 */
@Service
public class AlarmSenderServiceImpl implements AlarmSenderService {

    private static Logger logger = LoggerFactory.getLogger(AlarmSenderServiceImpl.class);

    @Override
    public HttpResponseTemp<?> sendSMS(String tos, String content, String subject, String sender) {
        if (tos == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "tos is null");
        }

        if (content == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "content is null");
        }

        sender = EncodingTool.getSMSSender(sender);

        send(tos, subject, content, sender);
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> sendMail(String tos, String content, String subject, String sender) {
        if (tos == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "tos is null");
        }

        if (content == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "content is null");
        }

        sender = EncodingTool.getMailSender(sender);

        String result = "";
        String[] numbers = tos.split(",");
        for (String number : numbers) {
            if (StringUtils.checkEmailPattern(number)) {
                String[] param = {number, subject, content};
                try {
                    HashMap<String, String> mailParam = (HashMap<String, String>) GroovyLoadAndInvoke
                            .loadAndInvokeGroovy(sender, "send", param);
                    if (mailParam != null && mailParam.containsKey("host") && mailParam.containsKey("fromAddr")) {
                        if (mailParam.containsKey("number")) {
                            number = mailParam.get("number");
                        }
                        if (mailParam.containsKey("subject")) {
                            subject = mailParam.get("subject");
                        }
                        if (mailParam.containsKey("content")) {
                            content = mailParam.get("content");
                        }
                        result += MailService.send(mailParam.get("host"), mailParam.get("fromAddr"), number, subject, content);
                    }
                } catch (IOException | IllegalAccessException | InstantiationException | MessagingException e) {
                    logger.warn("send alarm message error, mail: " + number + ", message: " + content);
                }
            }
        }
        if (StringUtils.isBlank(result)) {
            return ResultStat.OK.wrap(null);
        } else {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, result);
        }
    }

    @Override
    public HttpResponseTemp<?> sendWechat(String tos, String content, String subject, String sender) {
        if (tos == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "tos is null");
        }

        if (content == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "content is null");
        }

        sender = EncodingTool.getWechatSender(sender);

        send(tos, subject, content, sender);

        return ResultStat.OK.wrap(null);
    }

    private void send(String tos, String subject, String content, String sender) {
        String[] numbers = tos.split(",");
        for (String number : numbers) {
            if (StringUtils.checkMobilePattern(number)) {
                String[] param = {number, subject, content};
                try {
                    GroovyLoadAndInvoke.loadAndInvokeGroovy(sender, "send", param);
                } catch (IOException | IllegalAccessException | InstantiationException e) {
                    logger.warn("send alarm message error, phone: " + number + ", message: " + content);
                }
            }
        }
    }
}
