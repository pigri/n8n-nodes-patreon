import type { INodeProperties } from 'n8n-workflow';

export const memberOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		default: 'get_member',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['member'],
			},
		},
		options: [
			{
				name: 'Get a Member',
				value: 'get_member',
				action: 'Get a member',
			},
			{
				name: 'Get All Members',
				value: 'get_all_members',
				description: 'Get all campaign members',
				action: 'Get all campaign members',
			},
		],
	},
];

export const memberFields: INodeProperties[] = [
	{
		displayName: 'Member ID',
		name: 'value',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['get_member'],
				resource: ['member'],
			},
		},
		default: '',
		required: true,
		description: 'Patreon member ID',
	},
	{
		displayName: 'Campaign ID',
		name: 'value',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['get_all_members'],
				resource: ['member'],
			},
		},
		default: '',
		required: true,
		description: 'Patreon campaign ID',
	},
];
