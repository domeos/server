package org.domeos.framework.api.biz.deployment.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.domeos.framework.api.biz.deployment.DeployEventBiz;
import org.domeos.framework.api.mapper.domeos.deployment.DeployEventMapper;
import org.domeos.framework.api.model.collection.CollectionAuthorityMap;
import org.domeos.framework.api.model.deployment.DeployEvent;
import org.domeos.framework.api.model.deployment.DeployEventDBProto;
import org.domeos.framework.engine.exception.DaoConvertingException;
import org.domeos.framework.engine.model.CustomObjectMapper;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedList;
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
    public long createEvent(DeployEvent event) {
        deployEventMapper.createEvent(event, event.toString());
        return event.getEid();
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
    public void updateEvent(DeployEvent event) {
        deployEventMapper.updateEvent(event.getEid(), event.getEventStatus(),
                event.getStatusExpire(), event.toString());
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

    @Override
    public List<DeployEvent> listRecentEventByDeployCollectionIdTime(List<CollectionAuthorityMap> mapList, long startTime) {
        List<DeployEvent> eventList = new LinkedList<>();
        try {
            if (mapList == null || mapList.size() == 0) {
                return new ArrayList<>(1);
            }
            StringBuilder builder = new StringBuilder();
            builder.append(" ( ");
            for (int i = 0; i < mapList.size(); i++) {
                builder.append(mapList.get(i).getCollectionId());
                if (i != mapList.size() - 1) {
                    builder.append(" , ");
                }
            }
            builder.append(") ");
            List<DeployEventDBProto> protoList = deployEventMapper.listRecentEventByDeployCollectionIdTime(builder.toString(), startTime);

            for (DeployEventDBProto proto : protoList) {
                DeployEvent event = getEventFromProto(proto);
                if (event != null) {
                    eventList.add(event);
                }
            }
        } catch (Exception e) {
            throw new DaoConvertingException("Get MySQL Data failed! tableName=" + DEPLOY_EVENT_NAME, e);
        }
        return eventList;
    }

    @Override
    public List<DeployEvent> listRecentEventAllDeploymentIncludeRemovedByTime(long startTime) {
        List<DeployEvent> eventList = new LinkedList<>();
        try {
            List<DeployEventDBProto> protoList = deployEventMapper.listRecentEventAllDeploymentIncludeRemovedByTime(startTime);
            for (DeployEventDBProto proto : protoList) {
                DeployEvent event = getEventFromProto(proto);
                if (event != null) {
                    eventList.add(event);
                }
            }
        } catch (Exception e) {
            throw new DaoConvertingException("Get MySQL Data failed! tableName=" + DEPLOY_EVENT_NAME, e);
        }
        return eventList;
    }

    private DeployEvent getEventFromProto(DeployEventDBProto proto) {
        try {
            DeployEvent event = objectMapper.readValue(proto.getContent(), DeployEvent.class);
            event.setEid(proto.getEid());
            event.setEventStatus(proto.getEventStatus());
            event.setDeployId(proto.getDeployId());
            event.setOperation(proto.getOperation());
            event.setStatusExpire(proto.getStatusExpire());
            event.setStartTime(proto.getStartTime());
            JSONObject content = new JSONObject(proto.getContent());
            event.setUserName(content.getString("userName"));
            return event;
        } catch (Exception ignored) {
        }
        return null;
    }
}
