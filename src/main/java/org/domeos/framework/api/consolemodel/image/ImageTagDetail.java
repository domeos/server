package org.domeos.framework.api.consolemodel.image;

/**
 * Created by feiliu206363 on 2016/9/27.
 */
public class ImageTagDetail implements Comparable {
    private String registry;
    private String name;
    private String tag;
    private double size;
    private long createTime;

    public String getRegistry() {
        return registry;
    }

    public ImageTagDetail setRegistry(String registry) {
        this.registry = registry;
        return this;
    }

    public String getName() {
        return name;
    }

    public ImageTagDetail setName(String name) {
        this.name = name;
        return this;
    }

    public String getTag() {
        return tag;
    }

    public ImageTagDetail setTag(String tag) {
        this.tag = tag;
        return this;
    }

    public double getSize() {
        return size;
    }

    public ImageTagDetail setSize(double size) {
        this.size = size;
        return this;
    }

    public long getCreateTime() {
        return createTime;
    }

    public ImageTagDetail setCreateTime(long createTime) {
        this.createTime = createTime;
        return this;
    }

    @Override
    public int compareTo(Object o) {
        if (o == null) {
            return 0;
        }
        if (o instanceof ImageTagDetail) {
            ImageTagDetail detail = (ImageTagDetail) o;
            if (this.createTime > detail.getCreateTime()) {
                return 1;
            } else if (this.createTime < detail.getCreateTime()) {
                return -1;
            } else {
                return 0;
            }
        }
        return 0;
    }
}
