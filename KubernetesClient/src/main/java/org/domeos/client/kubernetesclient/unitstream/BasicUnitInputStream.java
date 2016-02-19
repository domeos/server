package org.domeos.client.kubernetesclient.unitstream;

import org.apache.log4j.Logger;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.LinkedList;

/**
 * Created by anningluo on 15-12-3.
 */
public abstract class BasicUnitInputStream<T> implements ClosableUnitInputStream<T> {
    private static char separateMark = '\n';
    private static char bufferSize = 1024;
    protected static Logger logger = Logger.getLogger(BasicUnitInputStream.class);

    private InputStream input;
    // private CloseableHttpResponse response;
    protected ByteArrayOutputStream outputStream;
    protected LinkedList<ByteArrayOutputStream> streamsList;
    private byte[] tmpBuffer;
    private boolean isEnd;
    /*
    public void init(CloseableHttpResponse response) throws IOException {
        this.response = response;
        this.input = response.getEntity().getContent();
        if (this.response == null) {
            throw new IOException("none http response initailized");
        }
        if (this.input == null) {
            throw  new IOException("none input stream initialized");
        }
        this.outputStream = new ByteArrayOutputStream();
        this.tmpBuffer = new byte[bufferSize];
        this.isEnd = false;
        this.streamsList= new LinkedList<>();
    }
    */
    public void init(InputStream input) {
        this.input = input;
        /*
        if (this.input == null) {
            throw  new KubeInternalErrorException("none input stream initialized");
        }
        */
        this.outputStream = new ByteArrayOutputStream();
        this.tmpBuffer = new byte[bufferSize];
        this.isEnd = false;
        this.streamsList= new LinkedList<>();

    }
    public boolean isEnd() {
        return this.isEnd;
    }
    protected abstract T formatOutput(ByteArrayOutputStream stream) throws IOException;
    protected T readUnit() throws IOException {
        if (this.input == null) {
            throw new IOException("none input stream initialized");
        }
        if (this.streamsList.size() != 0) {
            return formatOutput(streamsList.pop());
        }
        if (isEnd) {
            return null;
        }
        // read block
        int tmpReadLength = 0;
        T result = null;
        while (true) {
            tmpReadLength = input.read(tmpBuffer);
            logger.debug("[PIECE]" + new String(tmpBuffer, 0, tmpReadLength));
            int i = 0;
            int lastIdx = 0;
            for (; i < tmpReadLength; i++) {
                if (this.tmpBuffer[i] == '\n') {
                    outputStream.write(tmpBuffer, lastIdx, i - lastIdx);
                    if (result == null) {
                        result = formatOutput(outputStream);
                        outputStream.reset();
                    } else {
                        streamsList.add(outputStream);
                        outputStream = new ByteArrayOutputStream();
                    }
                    lastIdx = i + 1;
                }
            }
            if (result != null) {
                return result;
            }
            if (tmpReadLength == -1) {
                isEnd = true;
                if (outputStream.size() == 0) {
                    return null;
                }
                return formatOutput(outputStream);
            } else if (lastIdx != tmpReadLength) {
                outputStream.write(tmpBuffer, lastIdx, tmpReadLength - lastIdx);
            }
        }
    }
    public T read() throws IOException {
        return  readUnit();
    }
    public int read(T[] units) throws IOException {
        if (units == null) {
            return 0;
        }
        T tmpUnit;
        for (int i = 0; i != units.length; i++) {
            tmpUnit = readUnit();
            if (tmpUnit == null) {
                return i;
            }
            units[i] = tmpUnit;
        }
        return units.length;
    }
    public int read(T[] units, int start, int length) throws IOException {
        if (units == null) {
            return 0;
        }
        T tmpUnit;
        for (int i = start; i != length; i++) {
            tmpUnit = readUnit();
            if (tmpUnit == null) {
                return i - start;
            }
            units[i] = tmpUnit;
        }
        return length - start;
    }
    public void close() throws IOException {
        if (this.input != null) {
            this.input.close();
            input = null;
        }
    }
}
