package org.domeos.framework.api.controller.event;

import io.fabric8.kubernetes.api.model.Event;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.consolemodel.event.EventInfo;
import org.domeos.framework.api.controller.ApiController;
import org.domeos.framework.api.model.event.EventKind;
import org.domeos.framework.api.model.event.ReportEvent;
import org.domeos.framework.api.service.event.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

/**
 * Created by xupeng on 16-3-29.
 */
@Controller
@RequestMapping("/api/k8sevent")
public class EventController extends ApiController {

    @Autowired
    EventService eventService;

    @ResponseBody
    @RequestMapping(value = "/get/byhost", method = RequestMethod.GET)
    HttpResponseTemp<List<Event>> getEventsByHost(@RequestParam String host) throws IOException {
        return eventService.getEventsByHost(host);
    }

    @ResponseBody
    @RequestMapping(value = "/get/bynamespace", method = RequestMethod.GET)
    HttpResponseTemp<List<Event>> getEventsByNamespace(@RequestParam(required = true) int clusterId,
                                     @RequestParam(required = true) String namespace) throws IOException {
        return eventService.getEventsByNamespace(clusterId, namespace);
    }

    @ResponseBody
    @RequestMapping(value = "/get/bykind", method = RequestMethod.GET)
    HttpResponseTemp<List<Event>> getEventsByKindAndNamespace(@RequestParam(required = true) int clusterId,
                                            @RequestParam(required = true) String namespace,
                                            @RequestParam(required = true) EventKind kind) throws IOException {
        return eventService.getEventsByKindAndNamespace(clusterId, namespace, kind);
    }

    @ResponseBody
    @RequestMapping(value = "/get/bydeploy", method = RequestMethod.GET)
    HttpResponseTemp<List<EventInfo>> getEventsByDeployId(@RequestParam(required = true) int deployId) throws IOException {
        return eventService.getEventsByDeployId(deployId);
    }

    @ResponseBody
    @RequestMapping(value = "/report", method = RequestMethod.POST)
    HttpResponseTemp<?> reportEvent(@RequestBody ReportEvent reportEvent) throws IOException {
        return eventService.reportEvent(reportEvent);
    }
}
