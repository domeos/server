package org.domeos.framework.engine.runtime;

import org.domeos.framework.api.biz.alarm.AlarmBiz;
import org.domeos.framework.api.biz.alarm.PortalBiz;
import org.domeos.framework.api.model.alarm.StrategyInfo;
import org.domeos.framework.api.model.alarm.TemplateInfoBasic;
import org.domeos.framework.api.model.alarm.TemplateType;
import org.domeos.framework.api.model.deployment.Deployment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.DependsOn;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * Created by baokangwang on 2016/4/19.
 */
@Component
@DependsOn("kubeServiceInfo")
public class DeployAlarmPortalManager {

    static PortalBiz portalBiz;
    static AlarmBiz alarmBiz;

    private static final long FIRST_RUN_WAIT_SECONDS = 10;
    private static final long RUN_INTERVAL_SECONDS = 300;
    private static boolean deployAlarmPortalManagerIsRunning = false;

    @PostConstruct
    public void init() {
        if (!deployAlarmPortalManagerIsRunning) {
            startUpdateDeployAlarmPortal();
            deployAlarmPortalManagerIsRunning = true;
        }
    }

    private static Logger logger = LoggerFactory.getLogger(DeployAlarmPortalManager.class);
    private ScheduledExecutorService executorService = Executors.newSingleThreadScheduledExecutor();

    private DeployAlarmPortalManager() {
    }

    @Autowired
    public void setPortalBiz(PortalBiz portalBiz) {
        DeployAlarmPortalManager.portalBiz = portalBiz;
    }

    @Autowired
    public void setAlarmBiz(AlarmBiz alarmBiz) {
        DeployAlarmPortalManager.alarmBiz = alarmBiz;
    }

    public void startUpdateDeployAlarmPortal() {
        executorService.scheduleWithFixedDelay(new UpdateDeployAlarmPortalRunnable(), FIRST_RUN_WAIT_SECONDS, RUN_INTERVAL_SECONDS,
                TimeUnit.SECONDS);
    }

    private class UpdateDeployAlarmPortalRunnable implements Runnable {
        @Override
        public void run() {

            List<TemplateInfoBasic> templateInfoBasics = alarmBiz.listTemplateInfoBasic();
            if (templateInfoBasics == null) {
                return;
            }
            for (TemplateInfoBasic templateInfoBasic : templateInfoBasics) {
                if (templateInfoBasic.getTemplateType().equals(TemplateType.host.name())) {
                    continue;
                }
                Deployment deployment = alarmBiz.getDeploymentByTemplateId(templateInfoBasic.getId());
                if (deployment == null) {
                    continue;
                }
                List<StrategyInfo> strategyInfos = alarmBiz.listStrategyInfoByTemplateId(templateInfoBasic.getId());
                portalBiz.updateDeployAlarmPortal(templateInfoBasic.getId(), deployment.getId(), strategyInfos);
            }
        }

    }

}
