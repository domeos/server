package org.domeos.framework.api.controller.alarm;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.controller.ApiController;
import org.domeos.framework.api.service.alarm.AlarmEventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * Created by baokangwang on 2016/4/14.
 */
@Controller
@RequestMapping("/api")
public class AlarmEventController extends ApiController {

    @Autowired
    AlarmEventService alarmEventService;

    @ResponseBody
    @RequestMapping(value = "/alarm/event", method = RequestMethod.GET)
    public HttpResponseTemp<?> listAlarmEventInfo() {
        return alarmEventService.listAlarmEventInfo();
    }

    @ResponseBody
    @RequestMapping(value = "/alarm/event/ignore", method = RequestMethod.POST)
    public HttpResponseTemp<?> ignoreAlarms(@RequestBody String alarmString) {
        return alarmEventService.ignoreAlarms(alarmString);
    }
}
