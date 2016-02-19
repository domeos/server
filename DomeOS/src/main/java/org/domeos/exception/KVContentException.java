package org.domeos.exception;

/**
 * the Exceptions caused by content error
 *
 * like EtcdException and so on
 *
 * you can use e.getCause() to get the original Exception
 */
public abstract class KVContentException extends Exception{

//    protected Reason reason;
//
//    public static enum Reason {
//        KeyNotFound, TestFailed, NotFile, NotDir, NodeExist, RootROnly, DirNotEmpty, UsageError, Unknown;
//
//        private Reason() { }
//    }

    public KVContentException(String message, Throwable cause) {
        super(message, cause);
    }

//    public final Reason getReason() {
//        return reason;
//    }

//    public static void wrapEtcdException(EtcdException e) {
//        EtcdError error = EtcdError.valueOf(e.errorCode);
//        switch (error) {
////            case KeyNotFound:
////                throw new KVNoSuchKeyException(error.name(), e);
////            case TestFailed:
////                return new
//            default:
//                throw new KVContentUnexpectedException(error.name(), e);
//        }
//
//    }
}
