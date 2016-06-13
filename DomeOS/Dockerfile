FROM tomcat:8.0.32-jre7

RUN rm -f /etc/localtime && \
    ln -s /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    rm -r /usr/local/tomcat/webapps/*

COPY target/DomeOS.war /usr/local/tomcat/webapps/ROOT.war

CMD ["/usr/local/tomcat/webapps/bin/catalina.sh", "run"]
