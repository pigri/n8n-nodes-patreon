import type { IHookFunctions, IWebhookFunctions } from 'n8n-core';

import type {
	IDataObject,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
} from 'n8n-workflow';

import { patreonApiRequest } from './GenericFunctions';

export class PatreonTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Patreon Trigger',
		name: 'patreonTrigger',
		icon: 'file:patreon.svg',
		group: ['trigger'],
		subtitle: '={{$parameter["events"]}}',
		version: 1,
		description: 'Starts the workflow when Patreon events occur',
		defaults: {
			name: 'Patreon Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'patreonOAuth2Api',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Events',
				name: 'events',
				type: 'options',
				default: 'members:create',
				required: true,
				typeOptions: {
					multipleValues: false,
				},
				options: [
					{
						name: 'Members Create',
						value: 'members:create',
						description:
							'Triggered when a new member is created. Note that you may get more than one of these per patron if they delete and renew their membership.',
					},
					{
						name: 'Members Delete',
						value: 'members.delete',
						description:
							'Triggered when a membership is deleted. Note that you may get more than one of these per patron if they delete and renew their membership.',
					},
					{
						name: 'Members Pledge Create',
						value: 'members:pledge:create',
						description:
							'Triggered when a new pledge is created for a member. This includes when a member is created through pledging, and when a follower becomes a patron.',
					},
					{
						name: 'Members Pledge Delete',
						value: 'members:pledge:delete',
						description: 'Triggered when a member deletes their pledge',
					},
					{
						name: 'Members Pledge Update',
						value: 'members:pledge:update',
						description: 'Triggered when a member updates their pledge',
					},
					{
						name: 'Members Update',
						value: 'members:update',
						description: 'Triggered when a member updates their pledge',
					},
					{
						name: 'Posts Delete',
						value: 'posts:delete',
						description: 'Triggered when a post is deleted on a campaign',
					},
					{
						name: 'Posts Publish',
						value: 'posts:publish',
						description: 'Triggered when a post is published on a campaign',
					},
					{
						name: 'Posts Update',
						value: 'posts:update',
						description: 'Triggered when a post is updated on a campaign',
					},
				],
			},
			{
				displayName: 'Campaign ID',
				name: 'campaignId',
				type: 'string',
				default: '',
				required: true,
			},
		],
	};

	// @ts-ignore (because of request)
	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				// Check all the webhooks which exist already if it is identical to the
				// one that is supposed to get created.
				const currentWebhookUrl = this.getNodeWebhookUrl('default') as string;
				const query = {
					'fields[webhook]':
						'last_attempted_at,num_consecutive_times_failed,paused,secret,triggers,uri',
				};

				const subscriptions = await patreonApiRequest.call(this, 'GET', '/webhooks', '', query);

				for (const subscription of subscriptions.data) {
					if (subscription.attributes.uri === currentWebhookUrl) {
						await patreonApiRequest.call(this, 'DELETE', `/webhooks/${subscription.id}`, '', {});
					}
				}

				return false;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				const hook_url = this.getNodeWebhookUrl('default');
				const camapignId = this.getNodeParameter('campaignId') as string;

				const event = this.getNodeParameter('events', []) as string[];

				const body: IDataObject = {
					data: {
						type: 'webhook',
						attributes: {
							triggers: [`${event}`],
							uri: `${hook_url}`,
						},
						relationships: {
							campaign: {
								data: { type: 'campaign', id: `${camapignId}` },
							},
						},
					},
				};

				await patreonApiRequest.call(this, 'POST', '/webhooks', body);

				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				const currentWebhookUrl = this.getNodeWebhookUrl('default') as string;
				const query = {
					'fields[webhook]':
						'last_attempted_at,num_consecutive_times_failed,paused,secret,triggers,uri',
				};

				const subscriptions = await patreonApiRequest.call(this, 'GET', '/webhooks', '', query);
				for (const subscription of subscriptions.data) {
					if (subscription.attributes.uri === currentWebhookUrl) {
						await patreonApiRequest.call(this, 'DELETE', `/webhooks/${subscription.id}`, '', {});
					}
				}

				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const bodyData = this.getBodyData();

		const returnData: IDataObject[] = [];

		returnData.push({
			body: bodyData,
			headers: this.getHeaderData(),
			query: this.getQueryData(),
		});

		return {
			workflowData: [this.helpers.returnJsonArray(returnData)],
		};
	}
}
