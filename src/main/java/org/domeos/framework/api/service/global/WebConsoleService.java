package org.domeos.framework.api.service.global;

import org.domeos.framework.api.model.global.WebSsh;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.model.collection.related.ResourceType;

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
    void getWebConsole(String host, String container, ResourceType type, int id, HttpServletRequest request, HttpServletResponse response);

    void postWebConsole(HttpServletRequest request, HttpServletResponse response);

    /**
     *
     * @return
     */
    HttpResponseTemp<?> getWebsshSetting();

    /**
     *
     * @param webSsh
     * @return
     */
    HttpResponseTemp<?> setWebsshSetting(WebSsh webSsh);

    /**
     *
     * @param webSsh
     * @return
     */
    HttpResponseTemp<?> updateWebsshSetting(WebSsh webSsh);

    /**
     *
     * @return
     */
    HttpResponseTemp<?> deleteWebsshSetting();
}
