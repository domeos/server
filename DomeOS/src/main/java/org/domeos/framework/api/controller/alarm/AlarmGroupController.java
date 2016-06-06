package org.domeos.framework.api.controller.alarm;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.controller.ApiController;
import org.domeos.framework.api.model.alarm.AlarmGroupMember;
import org.domeos.framework.api.service.alarm.AlarmGroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Created by baokangwang on 2016/4/18.
 */
@Controller
@RequestMapping("/api")
public class AlarmGroupController extends ApiController {

    @Autowired
    AlarmGroupService alarmGroupService;

    @ResponseBody
    @RequestMapping(value = "/alarm/group", method = RequestMethod.GET)
    public HttpResponseTemp<?> listAlarmGroupMembers() {
        return alarmGroupService.listAlarmGroupMembers();
    }

    @ResponseBody
    @RequestMapping(value = "/alarm/group", method = RequestMethod.POST)
    public HttpResponseTemp<?> addAlarmGroupMembers(@RequestBody List<AlarmGroupMember> alarmGroupMembers) {
        return alarmGroupService.addAlarmGroupMembers(alarmGroupMembers);
    }

    @ResponseBody
    @RequestMapping(value = "/alarm/group/{id}", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteAlarmGroupMember(@PathVariable int id) {
        return alarmGroupService.deleteAlarmGroupMember(id);
    }
}