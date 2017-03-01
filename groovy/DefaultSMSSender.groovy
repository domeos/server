import groovyx.net.http.HTTPBuilder

class SohuSMSSender {
    public Object send(String number, String subject, String content) throws Exception {
        try {
            def params = ['body': ['number': number,
                                   'content'   : content]]
            def httpclient = new HTTPBuilder('http://sms.sohu.com')
            httpclient.post(params)
        } catch (Exception e) {
            return e.getMessage()
        }
        return ''
    }
}