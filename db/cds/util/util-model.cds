namespace util;

using { User } from '@sap/cds/common';

aspect Managed {
	local_create_dtm    : DateTime not null  @cds.on.insert:  $localNow                             @title: '로컬생성일시';
	local_update_dtm    : DateTime 			 @cds.on.insert:  $localNow  @cds.on.update: $localNow  @title: '로컬수정일시';	
	create_user_id      : User     not null  @cds.on.insert:  $userId                               @title: '생성자ID';		
	update_user_id      : User     			 @cds.on.insert:  $userId    @cds.on.update: $userId    @title: '수정자ID';
	system_create_dtm   : DateTime not null  @cds.on.insert:  $localNow                             @title: '시스템생성일시';	
	system_update_dtm   : DateTime 			 @cds.on.insert:  $localNow  @cds.on.update: $localNow  @title: '시스템수정일시';	
}