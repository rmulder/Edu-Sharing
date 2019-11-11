package org.edu_sharing.service.collection;

import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.StoreRef;
import org.edu_sharing.repository.server.MCAlfrescoAPIClient;
import org.edu_sharing.repository.server.MCAlfrescoBaseClient;
import org.edu_sharing.repository.server.tools.ApplicationInfoList;
import org.edu_sharing.service.nodeservice.NodeService;
import org.edu_sharing.service.nodeservice.NodeServiceFactory;
import org.edu_sharing.service.nodeservice.NodeServiceImpl;
import org.edu_sharing.spring.ApplicationContextFactory;

public class CollectionServiceFactory {
	
	public static CollectionService getCollectionService(String appId){
		CollectionServiceConfig config = (CollectionServiceConfig)ApplicationContextFactory.getApplicationContext().getBean("collectionServiceConfig");
		return new CollectionServiceImpl(appId, config.getPattern(), config.getPath());
	}
	public static CollectionService getLocalService() {
		return CollectionServiceFactory.getCollectionService(ApplicationInfoList.getHomeRepository().getAppId());
	}
	public static NodeRef getCollectionHome(){
		CollectionServiceConfig config = (CollectionServiceConfig)ApplicationContextFactory.getApplicationContext().getBean("collectionServiceConfig");
		String[] path=config.getPath().split(":");
		return new NodeRef(StoreRef.STORE_REF_WORKSPACE_SPACESSTORE,NodeServiceFactory.getLocalService().findNodeByName(new MCAlfrescoAPIClient().getCompanyHomeNodeId(),path[path.length-1]));
	}
}
