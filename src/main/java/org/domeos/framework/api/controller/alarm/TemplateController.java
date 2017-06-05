package org.domeos.framework.api.controller.alarm;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.controller.ApiController;
import org.domeos.framework.api.consolemodel.alarm.TemplateInfo;
import org.domeos.framework.api.service.alarm.TemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

/**
 * Created by baokangwang on 2016/4/13.
 */
@Controller
@RequestMapping("/api")
public class TemplateController extends ApiController {

    @Autowired
    TemplateService templateService;

    @ResponseBody
    @RequestMapping(value = "/alarm/template", method = RequestMethod.GET)
    public HttpResponseTemp<?> listTemplateInfo() {
        return templateService.listTemplateInfo();
    }

    @ResponseBody
    @RequestMapping(value = "/alarm/template", method = RequestMethod.POST)
    public HttpResponseTemp<?> createTemplate(@RequestBody TemplateInfo templateInfo) {
        return templateService.createTemplate(templateInfo);
    }

    @ResponseBody
    @RequestMapping(value = "/alarm/template", method = RequestMethod.PUT)
    public HttpResponseTemp<?> modifyTemplate(@RequestBody TemplateInfo templateInfo) {
        return templateService.modifyTemplate(templateInfo);
    }

    @ResponseBody
    @RequestMapping(value = "/alarm/template/{id}", method = RequestMethod.GET)
    public HttpResponseTemp<?> getTemplateInfo(@PathVariable long id) {
        return templateService.getTemplateInfo(id);
    }

    @ResponseBody
    @RequestMapping(value = "/alarm/template/{id}", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteTemplate(@PathVariable long id) {
        return templateService.deleteTemplate(id);
    }

}
