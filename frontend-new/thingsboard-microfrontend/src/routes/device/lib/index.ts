
export const getThresholdLabel = (type: string) => {
switch (type) {
    case 'minimum': return 'Min';
    case 'maximum': return 'Max';
    case 'equal': return 'Equal';
    case 'not_equal': return 'Not Equal';
    default: return type;
}
};

export const getThresholdColor = (type: string) => {
switch (type) {
    case 'minimum': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'maximum': return 'bg-red-100 text-red-800 border-red-200';
    case 'equal': return 'bg-green-100 text-green-800 border-green-200';
    case 'not_equal': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
}
};