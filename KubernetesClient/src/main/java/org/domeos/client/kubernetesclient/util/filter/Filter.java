package org.domeos.client.kubernetesclient.util.filter;

/**
 * Created by anningluo on 2016/1/4.
 */
public class Filter {
    private static PodNotTerminatedFilter podNotTerminatedFilter = new PodNotTerminatedFilter();
    private static PodSuccessRunningFilter podSuccessRunningFilter = new PodSuccessRunningFilter();
    public static PodNotTerminatedFilter getPodNotTerminatedFilter() {
        return podNotTerminatedFilter;
    }
    public static PodSuccessRunningFilter getPodSuccessRunningFilter() {
        return podSuccessRunningFilter;
    }
}

