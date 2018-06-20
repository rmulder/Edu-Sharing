package org.edu_sharing.repository.server.sitemap.xml;
import org.edu_sharing.repository.server.sitemap.SitemapServlet;

import javax.xml.bind.annotation.*;
import java.util.ArrayList;
import java.util.Collection;

@XmlRootElement(namespace = SitemapServlet.NS_SITEMAP)
public class Urlset {
    @XmlElement(namespace = SitemapServlet.NS_SITEMAP) public Collection<Url> url=new ArrayList<>();

    public static class Url{
        @XmlElement(namespace = SitemapServlet.NS_SITEMAP) public String loc;
        @XmlElement(namespace = "http://www.google.com/schemas/sitemap-image/1.1") public Collection<Image> image=new ArrayList<>();
        public static class Image{
            @XmlElement(namespace = "http://www.google.com/schemas/sitemap-image/1.1") public String loc;
        }
    }
}
