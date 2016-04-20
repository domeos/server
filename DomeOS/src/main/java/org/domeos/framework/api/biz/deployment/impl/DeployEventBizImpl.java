package org.domeos.framework.api.biz.deployment.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.domeos.framework.api.biz.deployment.DeployEventBiz;
import org.domeos.framework.api.mapper.deployment.DeployEventMapper;
import org.domeos.framework.api.model.deployment.DeployEvent;
import org.domeos.framework.api.model.deployment.DeployEventDBProto;
import org.domeos.framework.engine.model.CustomObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 */
@Service("deployEventBiz")
public class DeployEventBizImpl implements DeployEventBiz {

    @Autowired
    DeployEventMapper deployEventMapper;

    @Autowired
    CustomObjectMapper objectMapper;

    @Override
    public void createEvent(DeployEvent event) throws JsonProcessingException {
        DeployEventDBProto proto = buildDBProto(event);
        deployEventMapper.createEvent(proto);
    }

    @Override
    public DeployEvent getEvent(long eid) throws IOException {
        return buildEvent(deployEventMapper.getEvent(eid));
    }

    @Override
    public List<DeployEvent> getEventByDeployId(int deployId) throws IOException {
        List<DeployEventDBProto> protos = deployEventMapper.getEventByDeployId(deployId);
        if (protos == null || protos.size() == 0) {
            return null;
        }
        List<DeployEvent> events = new ArrayList<>(protos.size());
        for (DeployEventDBProto proto : protos) {
            events.add(buildEvent(proto));
        }
        return events;
    }

    @Override
    public DeployEvent getNewestEventByDeployId(int deployId) throws IOException {
        return buildEvent(deployEventMapper.gentNewestEvent(deployId));
    }

//    @Override
//    public void updateEventStatus(long eid, DeployEventStatus status, long statusExpire) {
//        deployEventMapper.updateEventStatusWithExpire(eid, status, statusExpire);
//    }
//
//    @Override
//    public void updateEventStatus(long eid, DeployEventStatus status) {
//        deployEventMapper.updateEventStatus(eid, status);
//    }

    @Override
    public void updateEvent(long eid, DeployEvent event) throws JsonProcessingException {
        DeployEventDBProto proto = buildDBProto(event);
        proto.setEid(event.getEid());
        deployEventMapper.updateEvent(proto.getEid(), proto.getEventStatus(),
                proto.getStatusExpire(), objectMapper.writeValueAsString(event));
    }

    @Override
    public List<DeployEvent> getUnfinishedEvent() throws IOException {
        List<DeployEventDBProto> protos = deployEventMapper.getUnfinishedEvent();
        List<DeployEvent> events = new ArrayList<>(protos.size());
        for (DeployEventDBProto proto : protos) {
            events.add(buildEvent(proto));
        }
        return events;
    }

    private DeployEventDBProto buildDBProto(DeployEvent event) throws JsonProcessingException {
        DeployEventDBProto proto = new DeployEventDBProto();
        String content = objectMapper.writeValueAsString(event);
        proto.setContent(content);
        proto.setDeployId(event.getDeployId());
        proto.setOperation(event.getOperation());
        proto.setEventStatus(event.getEventStatus());
        proto.setStatusExpire(event.getStatusExpire());
        return proto;
    }

    private DeployEvent buildEvent(DeployEventDBProto proto) throws IOException {
        if (proto == null) {
            return null;
        }
        DeployEvent event = objectMapper.readValue(proto.getContent(), DeployEvent.class);
        event.setEid(proto.getEid());
        event.setEventStatus(proto.getEventStatus());
        event.setDeployId(proto.getDeployId());
        event.setOperation(proto.getOperation());
        event.setStatusExpire(proto.getStatusExpire());
        return event;
    }
}
