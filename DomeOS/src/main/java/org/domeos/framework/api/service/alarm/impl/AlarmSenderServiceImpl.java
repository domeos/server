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

        // implement sms sender here

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

        // implement mail sender here

        return ResultStat.OK.wrap(null);
    }
}
