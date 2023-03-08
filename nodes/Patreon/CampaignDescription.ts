import type { INodeProperties } from 'n8n-workflow';

export const campaignOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		default: 'get_campaign',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['campaign'],
			},
		},
		options: [
			{
				name: 'Get a Campaign',
				value: 'get_campaign',
				action: 'Get a campaign',
				displayOptions: {
					show: {
						resource: ['campaign'],
					},
				},
			},
			{
				name: 'Get All',
				value: 'get_all',
				description: 'Get all campaigns',
				action: 'Get all campaigns',
				displayOptions: {
					show: {
						resource: ['campaign'],
					},
				},
			},
			{
				name: 'Get All Members',
				value: 'get_all_members',
				description: 'Get all campaign members',
				action: 'Get all campaign members',
				displayOptions: {
					show: {
						resource: ['campaign'],
					},
				},
			},
		],
	},
];

export const campaignFields: INodeProperties[] = [
	{
		displayName: 'Campaign ID',
		name: 'value',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['get_campaign', 'get_all_members', 'get_all_posts'],
				resource: ['campaign'],
			},
		},
		default: '',
		required: true,
		description: 'Patreon campaign ID',
	},
];
