package org.domeos.api.service.global;

import org.domeos.api.model.global.WebSsh;
import org.domeos.basemodel.HttpResponseTemp;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Created by baokangwang on 2016/1/16.
 */
public interface WebConsoleService {

    /**
     *
     * @param host
     * @param container
     * @param request
     * @param response
     */
    void getWebConsole(String host, String container, HttpServletRequest request, HttpServletResponse response);

    void postWebConsole(HttpServletRequest request, HttpServletResponse response);

    /**
     *
     * @param userId
     * @return
     */
    HttpResponseTemp<?> getWebsshSetting(long userId);

    /**
     *
     * @param webSsh
     * @param useId
     * @return
     */
    HttpResponseTemp<?> setWebsshSetting(WebSsh webSsh, long useId);

    /**
     *
     * @param webSsh
     * @param userId
     * @return
     */
    HttpResponseTemp<?> updateWebsshSetting(WebSsh webSsh, long userId);

    /**
     *
     * @param userId
     * @return
     */
    HttpResponseTemp<?> deleteWebsshSetting(long userId);
}
