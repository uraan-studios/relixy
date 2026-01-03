
import { Zap, MessageSquare, Type, MousePointerClick, Split, Repeat, Clock, HelpCircle, FileText, List } from "lucide-react";

export type PropertyFieldType = 'text' | 'textarea' | 'number' | 'select' | 'list' | 'info' | 'variable';

export interface PropertyField {
    key: string;
    type: PropertyFieldType;
    label: string;
    placeholder?: string;
    description?: string;
    options?: { label: string; value: string }[]; // For select
    defaultValue?: any;
    min?: number;
    max?: number;
}

export interface NodeDefinition {
    type: string;
    title: string;
    icon: any;
    color: string;
    colorClass: string; // Tailwind class for text/bg
    summaryKey?: string; // Which data key to show on canvas summary
    summaryTemplate?: string; // e.g. "Wait {{delayTime}} {{unit}}"
    defaultData: any;
    schema: PropertyField[];
}

export const NODE_REGISTRY: Record<string, NodeDefinition> = {
    trigger: {
        type: 'trigger',
        title: 'Trigger',
        icon: Zap,
        color: '#f59e0b',
        colorClass: 'bg-amber-500',
        summaryKey: 'triggerKeyword',
        defaultData: { triggerKeyword: 'start' },
        schema: [
            {
                key: 'triggerKeyword',
                type: 'text',
                label: 'Keywords',
                placeholder: 'e.g. hi, hello',
                description: 'Comma separated words that start this flow.'
            }
        ]
    },
    message: {
        type: 'message',
        title: 'Send Message',
        icon: MessageSquare,
        color: '#3b82f6',
        colorClass: 'bg-blue-500',
        summaryKey: 'label',
        defaultData: { label: 'Hello!' },
        schema: [
            {
                key: 'label',
                type: 'textarea',
                label: 'Message Body',
                placeholder: 'Type your message...',
                description: 'Use {{variable}} to insert dynamic data.'
            }
        ]
    },
    input: {
        type: 'input',
        title: 'Ask Question',
        icon: Type,
        color: '#14b8a6',
        colorClass: 'bg-teal-500',
        summaryKey: 'question',
        defaultData: { question: 'What is your name?', variable: 'name' },
        schema: [
            {
                key: 'question',
                type: 'textarea',
                label: 'Question',
                placeholder: 'What would you like to ask?'
            },
            {
                key: 'variable',
                type: 'variable',
                label: 'Save Answer To',
                placeholder: 'variable_name'
            }
        ]
    },
    button: {
        type: 'button',
        title: 'Buttons / Options',
        icon: MousePointerClick,
        color: '#a855f7',
        colorClass: 'bg-purple-500',
        summaryKey: 'label',
        defaultData: { label: 'Select an option:', options: ['Option 1'] },
        schema: [
            {
                key: 'label',
                type: 'text',
                label: 'Question Text',
                placeholder: 'Make a choice:'
            },
            {
                key: 'options',
                type: 'list',
                label: 'Options',
                description: 'Each option creates a new branch.'
            }
        ]
    },
    menu: {
        type: 'menu',
        title: 'List Menu',
        icon: List,
        color: '#ec4899',
        colorClass: 'bg-pink-500',
        summaryKey: 'body',
        defaultData: { header: 'Menu', body: 'Please select from the list:', footer: '', button: 'View Options', options: ['Option 1'] },
        schema: [
            {
                key: 'header',
                type: 'text',
                label: 'Header Text',
                placeholder: 'Bold Top Text'
            },
            {
                key: 'body',
                type: 'textarea',
                label: 'Body Text',
                placeholder: 'Main message content...'
            },
            {
                key: 'footer',
                type: 'text',
                label: 'Footer Text',
                placeholder: 'Small bottom text'
            },
            {
                key: 'button',
                type: 'text',
                label: 'Button Label',
                placeholder: 'View Menu'
            },
            {
                key: 'options',
                type: 'list',
                label: 'Menu Items',
                description: 'List items (up to 10).'
            }
        ]
    },
    condition: {
        type: 'condition',
        title: 'Condition',
        icon: Split,
        color: '#e11d48',
        colorClass: 'bg-rose-500',
        summaryTemplate: 'If {{variable}} {{operator}} {{value}}',
        defaultData: { variable: 'var', operator: 'equals', value: '' },
        schema: [
            {
                key: 'variable',
                type: 'variable',
                label: 'Variable',
                placeholder: 'check_var'
            },
            {
                key: 'operator',
                type: 'select',
                label: 'Operator',
                options: [
                    { label: 'Equals (==)', value: 'equals' },
                    { label: 'Contains', value: 'contains' },
                    { label: 'Greater Than (>)', value: 'gt' },
                    { label: 'Less Than (<)', value: 'lt' }
                ]
            },
            {
                key: 'value',
                type: 'text',
                label: 'Value',
                placeholder: 'compare value...'
            },
            {
                key: 'info',
                type: 'info',
                label: 'Note',
                description: 'Connect Green handle for TRUE, Red for FALSE.'
            }
        ]
    },
    loop: {
        type: 'loop',
        title: 'Loop',
        icon: Repeat,
        color: '#f97316',
        colorClass: 'bg-orange-500',
        summaryTemplate: 'Run {{count}} times',
        defaultData: { count: 3 },
        schema: [
            {
                key: 'count',
                type: 'number',
                label: 'Loop Count',
                defaultValue: 3,
                min: 1,
                max: 50
            }
        ]
    },
    delay: {
        type: 'delay',
        title: 'Delay',
        icon: Clock,
        color: '#64748b',
        colorClass: 'bg-slate-500',
        summaryTemplate: 'Wait {{delayTime}} {{unit}}',
        defaultData: { delayTime: 5, unit: 'sec' },
        schema: [
            {
                key: 'delayTime',
                type: 'number',
                label: 'Duration',
                defaultValue: 5,
                min: 0
            },
            {
                key: 'unit',
                type: 'select',
                label: 'Unit',
                options: [
                    { label: 'Seconds', value: 'sec' },
                    { label: 'Minutes', value: 'min' },
                    { label: 'Hours', value: 'hour' }
                ]
            }
        ]
    }
};

export const getNodeDefinition = (type: string) => NODE_REGISTRY[type];
