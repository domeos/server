package org.domeos.framework.api.controller.alarm;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.controller.ApiController;
import org.domeos.framework.api.service.alarm.AlarmSenderService;
import org.domeos.util.EncodingTool;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * Created by baokangwang on 2016/5/6.
 */
@Controller
@RequestMapping("/api")
public class AlarmSenderController extends ApiController {

    @Autowired
    AlarmSenderService alarmSenderService;

    @ResponseBody
    @RequestMapping(value = "/alarm/send/sms", method = RequestMethod.POST)
    public HttpResponseTemp<?> listAlarmEventInfo(@RequestParam("tos") String tos,
                                                  @RequestParam("content") String content) {
        content = EncodingTool.encodeStr(content);
        return alarmSenderService.sendSMS(tos, content);
    }

    @ResponseBody
    @RequestMapping(value = "/alarm/send/mail", method = RequestMethod.POST)
    public HttpResponseTemp<?> listAlarmEventInfo(@RequestParam("tos") String tos,
                                                  @RequestParam("content") String content,
                                                  @RequestParam("subject") String subject) {
        content = EncodingTool.encodeStr(content);
        subject = EncodingTool.encodeStr(subject);
        return alarmSenderService.sendMail(tos, content, subject);
    }
}