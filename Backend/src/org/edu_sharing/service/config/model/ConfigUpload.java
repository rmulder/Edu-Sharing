package org.edu_sharing.service.config.model;

import javax.xml.bind.annotation.XmlElement;
import java.io.Serializable;

public class ConfigUpload implements Serializable {
    @XmlElement
    public ConfigUploadDialog postDialog;

    public enum ConfigUploadDialog {
        SimpleEdit,
        Mds
    }
}
