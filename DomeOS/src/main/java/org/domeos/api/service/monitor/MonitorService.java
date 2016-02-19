package org.domeos.api.service.monitor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Created by feiliu206363 on 2015/12/22.
 */
public interface MonitorService {

    /**
     *
     * @param clusterId
     * @param request
     * @param response
     * @param userId
     */
    void getChartsMonitor(int clusterId, HttpServletRequest request, HttpServletResponse response, long userId);

    /**
     *
     * @param clusterId
     * @param request
     * @param response
     * @param userId
     * @return
     */
    void getChartBigMonitor(int clusterId, HttpServletRequest request, HttpServletResponse response, long userId);

    /**
     *  @param request
     * @param response
     * @param userId
     */
    void getChartMonitor(HttpServletRequest request, HttpServletResponse response, long userId);

    /**
     *
     * @param clusterId
     * @param request
     * @param response
     * @param userId
     * @return
     */
    void getCountersMonitor(int clusterId, HttpServletRequest request, HttpServletResponse response, long userId);

    /**
     *
     * @param clusterId
     * @param request
     * @param response
     * @param userId
     * @return
     */
    void putChartsMonitor(int clusterId, HttpServletRequest request, HttpServletResponse response, long userId);

    /**
     *
     * @param request
     * @param response
     * @param userId
     * @return
     */
    void getCssMonitor(HttpServletRequest request, HttpServletResponse response, long userId);
}
