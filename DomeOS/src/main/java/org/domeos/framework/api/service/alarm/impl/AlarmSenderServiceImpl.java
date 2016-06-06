package org.domeos.framework.api.service.alarm.impl;

import org.apache.log4j.Logger;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.service.alarm.AlarmSenderService;
import org.domeos.util.CheckMobileAndEmail;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

/**
 * Created by baokangwang on 2016/5/6.
 */
@Service("alarmSenderService")
public class AlarmSenderServiceImpl implements AlarmSenderService {

    private static Logger logger = Logger.getLogger(AlarmSenderServiceImpl.class);

    @Override
    public HttpResponseTemp<?> sendSMS(String tos, String content) {

        if (tos == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "tos is null");
        }
        if (content == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "content is null");
        }

        SMSSender smsSender = new SMSSender();
        Set<String> setNum = new HashSet<String>();
        String[] numbers = tos.split(",");
        for (String number : numbers) {
            if (CheckMobileAndEmail.checkMobile(number)) {
                setNum.add(number);
            }
        }
        try {
            smsSender.sendSMS(setNum, content);
        } catch (Exception e){
            throw ApiException.wrapUnknownException(e);
        }

        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> sendMail(String tos, String content, String subject) {

        if (tos == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "tos is null");
        }
        if (content == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "content is null");
        }
        if (subject == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "subject is null");
        }

        String validatedTos = "";
        String[] mails = tos.split(",");
        for (String mail : mails) {
            if (CheckMobileAndEmail.checkEmail(mail)) {
                validatedTos = validatedTos + mail + ",";
            }
        }
        if (validatedTos.length() != 0) {
            validatedTos = validatedTos.substring(0, validatedTos.length() - 1);
        }
        MailSender mailSender = new MailSender("internal.smtpcloud.sohu.com");
        mailSender.sendMail(validatedTos, subject, content);

        return ResultStat.OK.wrap(null);
    }
}
