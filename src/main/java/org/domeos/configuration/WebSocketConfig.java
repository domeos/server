package org.domeos.configuration;

import org.domeos.framework.api.service.deployment.InstanceLogHandler;
import org.domeos.framework.api.service.project.BuildLogHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.web.support.SpringBootServletInitializer;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * Created by feiliu206363 on 2017/2/8.
 */
@Configuration
@EnableWebSocket
@EnableAutoConfiguration
public class WebSocketConfig extends SpringBootServletInitializer implements WebSocketConfigurer {
    @Autowired
    InstanceLogHandler instanceLogHandler;
    @Autowired
    BuildLogHandler buildLogHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(instanceLogHandler, "/api/deploy/instance/log/realtime")
                .setAllowedOrigins("*").withSockJS().setHeartbeatTime(30000);
        registry.addHandler(buildLogHandler, "/api/ci/build/log/realtime")
                .setAllowedOrigins("*").withSockJS().setHeartbeatTime(30000);
    }
}
