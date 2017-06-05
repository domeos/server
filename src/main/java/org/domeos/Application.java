package org.domeos;

import org.apache.catalina.connector.Connector;
import org.apache.coyote.AbstractProtocol;
import org.domeos.global.GlobalConstant;
import org.domeos.util.StringUtils;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.embedded.EmbeddedServletContainerFactory;
import org.springframework.boot.context.embedded.tomcat.TomcatConnectorCustomizer;
import org.springframework.boot.context.embedded.tomcat.TomcatEmbeddedServletContainerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.springframework.web.socket.config.annotation.EnableWebSocket;

import java.util.Arrays;
import java.util.List;

/**
 * Created by feiliu206363 on 2017/2/6.
 */
@SpringBootApplication
@EnableWebSocket
public class Application extends WebMvcConfigurerAdapter {
    public static void main(String[] args) {
//        if (AuthConfigFactory.getFactory() == null) {
//            AuthConfigFactory.setFactory(new AuthConfigFactoryImpl());
//        }
        SpringApplication.run(Application.class, args);
    }

    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        StringHttpMessageConverter stringConverter = new StringHttpMessageConverter();
        stringConverter.setSupportedMediaTypes(Arrays.asList(MediaType.APPLICATION_OCTET_STREAM));
        stringConverter.setWriteAcceptCharset(false);
        converters.add(stringConverter);
    }

    @Bean
    public EmbeddedServletContainerFactory getEmbeddedServletContainerFactory() {
        TomcatEmbeddedServletContainerFactory containerFactory = new TomcatEmbeddedServletContainerFactory();
        containerFactory
                .addConnectorCustomizers(new TomcatConnectorCustomizer() {
                    @Override
                    public void customize(Connector connector) {
                        String keepAliveTimeout = System.getenv(GlobalConstant.TOMCAT_KEEPALIVETIMEOUT);
                        if (StringUtils.isBlank(keepAliveTimeout)) {
                            keepAliveTimeout = "5000";
                        }
                        ((AbstractProtocol) connector.getProtocolHandler())
                                .setKeepAliveTimeout(Integer.valueOf(keepAliveTimeout));

                        String connectionTimeout = System.getenv(GlobalConstant.TOMCAT_CONNECTIONTIMEOUT);
                        if (StringUtils.isBlank(connectionTimeout)) {
                            connectionTimeout = "20000";
                        }
                        ((AbstractProtocol) connector.getProtocolHandler())
                                .setConnectionTimeout(Integer.valueOf(connectionTimeout));

                        String acceptorThreadCount = System.getenv(GlobalConstant.TOMCAT_ACCEPTORTHREADCOUNT);
                        if (StringUtils.isBlank(acceptorThreadCount)) {
                            acceptorThreadCount = "1500";
                        }
                        ((AbstractProtocol) connector.getProtocolHandler())
                                .setAcceptorThreadCount(Integer.valueOf(acceptorThreadCount));

                        String maxThreads = System.getenv(GlobalConstant.TOMCAT_MAXTHREADS);
                        if (StringUtils.isBlank(maxThreads)) {
                            maxThreads = "1000";
                        }
                        ((AbstractProtocol) connector.getProtocolHandler())
                                .setMaxThreads(Integer.valueOf(maxThreads));

                        String minSpareThreads = System.getenv(GlobalConstant.TOMCAT_MINSPARETHREADS);
                        if (StringUtils.isBlank(minSpareThreads)) {
                            minSpareThreads = "200";
                        }
                        ((AbstractProtocol) connector.getProtocolHandler())
                                .setMinSpareThreads(Integer.valueOf(minSpareThreads));
                    }
                });
        return containerFactory;
    }
}
