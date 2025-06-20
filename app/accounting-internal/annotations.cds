using cm.excelUploadService as service from '../../srv/cds/excelUpload';
annotate service.ListZTCD1010 with @(
    Capabilities.SearchRestrictions: {
        Searchable: false
    },
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : mandt,
            },
            {
                $Type : 'UI.DataField',
                Value : yyyymm,
            },
            {
                $Type : 'UI.DataField',
                Value : com_code,
            },
            {
                $Type : 'UI.DataField',
                Value : com_name,
            },
            {
                $Type : 'UI.DataField',
                Value : trd_com_code,
            },
            {
                $Type : 'UI.DataField',
                Value : trd_com_name,
            },
            {
                $Type : 'UI.DataField',
                Value : account_code,
            },
            {
                $Type : 'UI.DataField',
                Value : account_name,
            },
            {
                $Type : 'UI.DataField',
                Value : ocdate,
            },
            {
                $Type : 'UI.DataField',
                Value : transtype,
            },
            {
                $Type : 'UI.DataField',
                Value : matchkey,
            },
            {
                $Type : 'UI.DataField',
                Value : amt,
            },
            {
                $Type : 'UI.DataField',
                Value : def_Amt,
            },
            {
                $Type : 'UI.DataField',
                Label : 'local_create_dtm',
                Value : local_create_dtm,
            },
            {
                $Type : 'UI.DataField',
                Label : 'create_user_id',
                Value : create_user_id,
            },
            {
                $Type : 'UI.DataField',
                Label : 'system_create_dtm',
                Value : system_create_dtm,
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup',
        },
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : com_code,
        },
        {
            $Type : 'UI.DataField',
            Value : com_name,
        },
        {
            $Type : 'UI.DataField',
            Value : account_code,
        },
        {
            $Type : 'UI.DataField',
            Value : account_name,
        },
        {
            $Type : 'UI.DataField',
            Value : trd_com_code,
        },
        {
            $Type : 'UI.DataField',
            Value : trd_com_name,
        },
        {
            $Type : 'UI.DataField',
            Value : transtype,
        },
        {
            $Type : 'UI.DataField',
            Value : ocdate,
        },
        {
            $Type : 'UI.DataField',
            Value : amt,
        },
        {
            $Type : 'UI.DataField',
            Value : def_Amt,
            ![@UI.Hidden],
            
        },
        {
            $Type : 'UI.DataField',
            Value : matchkey,
        },
        {
            $Type : 'UI.DataField',
            Value : detail_desc,
        },
        {
            $Type : 'UI.DataField',
            Value : yyyymm,
            ![@UI.Hidden]
        },
    ],
    UI.SelectionFields : [
        com_code,
        transtype,
    ],
);

annotate service.ListZTCD1010 with {
    com_code @(
        Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'ListCompany',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : com_code,
                    ValueListProperty : 'com_code',
                },
            ],
            Label : '법인명',
        },
        Common.ValueListWithFixedValues : true,
    )
};

annotate service.ListZTCD1010 with {
    transtype @(Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'ListTransType',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : transtype,
                    ValueListProperty : 'transtype',
                },
            ],
            Label : '전표유형',
        },
        Common.ValueListWithFixedValues : true
)};

annotate service.ListTransType with {
    transtype @Common.Text : transtype_name
};

