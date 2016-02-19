package org.domeos.client.kubernetesclient.unitstream;

import java.io.IOException;

/**
 * Created by anningluo on 15-12-3.
 */
public interface UnitInputStream<T> {
    public T read() throws IOException;
    public int read(T[] units) throws  IOException;
    public int read(T[] units, int start, int length) throws IOException;
}
