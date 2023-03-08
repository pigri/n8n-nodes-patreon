import type { IExecuteFunctions } from 'n8n-core';

import type {
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';

import { patreonApiRequest } from './GenericFunctions';

import { campaignFields, campaignOperations } from './CampaignDescription';
import { postFields, postOperations } from './PostDescription';
import { memberFields, memberOperations } from './MemberDescription';

export class Patreon implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Patreon',
		name: 'patreon',
		icon: 'file:patreon.svg',
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Consume Patreon API',
		defaults: {
			name: 'Patreon',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'patreonOAuth2Api',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Campaign',
						value: 'campaign',
					},
					{
						name: 'Member',
						value: 'member',
					},
					{
						name: 'Post',
						value: 'post',
					},
				],
				default: 'campaign',
			},
			...campaignOperations,
			...campaignFields,
			...postOperations,
			...postFields,
			...memberOperations,
			...memberFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		return new Promise(async (resolve, reject) => {
			const items = this.getInputData();
			const returnData: INodeExecutionData[] = [];
			const resource = this.getNodeParameter('resource', 0);
			const operation = this.getNodeParameter('operation', 0);
			for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
				try {
					if (resource === 'campaign') {
						if (operation === 'get_all') {
							const query = {
								'fields[campaign]':
									'created_at,creation_name,discord_server_id,image_small_url,image_url,is_charged_immediately,is_monthly,is_nsfw,main_video_embed,main_video_url,one_liner,one_liner,patron_count,pay_per_name,pledge_url,published_at,summary,thanks_embed,thanks_msg,thanks_video_url,has_rss,has_sent_rss_notify,rss_feed_title,rss_artwork_url,patron_count,discord_server_id,google_analytics_id',
							};
							const responseData = await patreonApiRequest.call(
								this,
								'GET',
								'/campaigns',
								'',
								query,
							);
							const result = this.helpers.returnJsonArray(responseData.data as IDataObject[]);
							returnData.push(...result);
						}
						if (operation === 'get_campaign') {
							const query = {
								'fields[campaign]':
									'created_at,creation_name,discord_server_id,image_small_url,image_url,is_charged_immediately,is_monthly,main_video_embed,main_video_url,one_liner,one_liner,patron_count,pay_per_name,pledge_url,published_at,summary,thanks_embed,thanks_msg,thanks_video_url',
							};

							const campaignId = this.getNodeParameter('value', itemIndex) as string;
							const responseData = await patreonApiRequest.call(
								this,
								'GET',
								`/campaigns/${campaignId}`,
								'',
								query,
							);
							const result = this.helpers.returnJsonArray(responseData.data as IDataObject[]);
							returnData.push(...result);
						}
					}
					if (resource === 'post') {
						const query = {
							'fields[post]':
								'title,content,is_paid,is_public,published_at,url,embed_data,embed_url,app_id,app_status',
						};

						if (operation === 'get_all_posts') {
							const campaignId = this.getNodeParameter('value', itemIndex) as string;
							const responseData = await patreonApiRequest.call(
								this,
								'GET',
								`/campaigns/${campaignId}/posts`,
								'',
								query,
							);
							const result = this.helpers.returnJsonArray(responseData.data as IDataObject[]);
							returnData.push(...result);
						}
						if (operation === 'get_post') {
							const postId = this.getNodeParameter('value', itemIndex) as string;
							const responseData = await patreonApiRequest.call(
								this,
								'GET',
								`/posts/${postId}`,
								'',
								query,
							);
							const result = this.helpers.returnJsonArray(responseData.data as IDataObject[]);
							returnData.push(...result);
						}
					}
					if (resource === 'member') {
						const query = {
							include: 'currently_entitled_tiers,address',
							'fields[member]':
								'full_name,is_follower,last_charge_date,last_charge_status,lifetime_support_cents,currently_entitled_amount_cents,patron_status',
							'fields[tier]':
								'amount_cents,created_at,description,discord_role_ids,edited_at,patron_count,published,published_at,requires_shipping,title,url',
							'fields[address]': 'addressee,city,line_1,line_2,phone_number,postal_code,state',
						};

						if (operation === 'get_all_members') {
							const campaignId = this.getNodeParameter('value', itemIndex) as string;
							const responseData = await patreonApiRequest.call(
								this,
								'GET',
								`/campaigns/${campaignId}/members`,
								'',
								query,
							);

							const result = this.helpers.returnJsonArray(responseData.data as IDataObject[]);
							returnData.push(...result);
						}

						if (operation === 'get_member') {
							const memberId = this.getNodeParameter('value', itemIndex) as string;
							const responseData = await patreonApiRequest.call(
								this,
								'GET',
								`/members/${memberId}`,
								'',
								query,
							);
							const result = this.helpers.returnJsonArray(responseData.data as IDataObject[]);
							returnData.push(...result);
						}
					}
					return resolve(this.prepareOutputData(returnData));
				} catch (error) {
					console.log(error);
					reject(error);
				}
			}
		});
	}
}
