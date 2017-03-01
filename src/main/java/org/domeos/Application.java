package org.domeos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
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
}
