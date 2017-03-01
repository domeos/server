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
    public HttpResponseTemp<?> SendAlarmSMS(@RequestParam("tos") String tos,
                                            @RequestParam("content") String content,
                                            @RequestParam("subject") String subject,
                                            @RequestParam(value = "sender", required = false) String sender) {
        content = EncodingTool.encodeStr(content);
        subject = EncodingTool.encodeStr(subject);
        return alarmSenderService.sendSMS(tos, content, subject, sender);
    }

    @ResponseBody
    @RequestMapping(value = "/alarm/send/mail", method = RequestMethod.POST)
    public HttpResponseTemp<?> SendAlarmMail(@RequestParam("tos") String tos,
                                             @RequestParam("content") String content,
                                             @RequestParam("subject") String subject,
                                             @RequestParam(value = "sender", required = false) String sender) {
        content = EncodingTool.encodeStr(content);
        subject = EncodingTool.encodeStr(subject);
        return alarmSenderService.sendMail(tos, content, subject, sender);
    }

    @ResponseBody
    @RequestMapping(value = "/alarm/send/wechat", method = RequestMethod.POST)
    public HttpResponseTemp<?> SendAlarmWechat(@RequestParam("tos") String tos,
                                               @RequestParam("content") String content,
                                               @RequestParam("subject") String subject,
                                               @RequestParam(value = "sender", required = false) String sender) {
        content = EncodingTool.encodeStr(content);
        subject = EncodingTool.encodeStr(subject);
        return alarmSenderService.sendWechat(tos, content, subject, sender);
    }
}