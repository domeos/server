package org.domeos.framework.api.model.monitor;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by baokangwang on 2016/3/1.
 */
public class CounterItems {

    private List<String> cpuCounters;
    private List<String> memCounters;
    private List<String> diskCounters;
    private List<String> networkCounters;

    public CounterItems(int count) {
        this.cpuCounters = new ArrayList<>(count);
        this.memCounters = new ArrayList<>(count);
        this.diskCounters = new ArrayList<>(count);
        this.networkCounters = new ArrayList<>(count);
    }

    public CounterItems(List<String> cpuCounters, List<String> memCounters, List<String> diskCounters, List<String> networkCounters) {
        this.cpuCounters = cpuCounters;
        this.memCounters = memCounters;
        this.diskCounters = diskCounters;
        this.networkCounters = networkCounters;
    }

    public List<String> getCpuCounters() {
        return cpuCounters;
    }

    public void setCpuCounters(List<String> cpuCounters) {
        this.cpuCounters = cpuCounters;
    }

    public List<String> getMemCounters() {
        return memCounters;
    }

    public void setMemCounters(List<String> memCounters) {
        this.memCounters = memCounters;
    }

    public List<String> getDiskCounters() {
        return diskCounters;
    }

    public void setDiskCounters(List<String> diskCounters) {
        this.diskCounters = diskCounters;
    }

    public List<String> getNetworkCounters() {
        return networkCounters;
    }

    public void setNetworkCounters(List<String> networkCounters) {
        this.networkCounters = networkCounters;
    }

    public void insertCounter(String counter, String targetType) {

        switch (targetType) {
            case "node" :
                if (counter.startsWith("cpu")) {
                    this.cpuCounters.add(counter);
                } else if (counter.startsWith("mem")) {
                    this.memCounters.add(counter);
                } else if (counter.startsWith("disk") || counter.startsWith("df")) {
                    this.diskCounters.add(counter);
                } else if (counter.startsWith("net")) {
                    this.networkCounters.add(counter);
                }
                break;
            case "pod" :
            case "container" :
                if (counter.startsWith("container.cpu")) {
                    this.cpuCounters.add(counter);
                } else if (counter.startsWith("container.mem")) {
                    this.memCounters.add(counter);
                } else if (counter.startsWith("container.disk") || counter.startsWith("container.df")) {
                    this.diskCounters.add(counter);
                } else if (counter.startsWith("container.net")) {
                    this.networkCounters.add(counter);
                }
        }
    }

    public List<String> getAllCounters() {

        List<String> result = new ArrayList<>();
        result.addAll(cpuCounters);
        result.addAll(memCounters);
        result.addAll(diskCounters);
        result.addAll(networkCounters);

        return result;
    }
}
