using cm.excelUploadService as service from '../../srv/cds/excelUpload';

annotate service.ListZTCD1000 with @(
    Capabilities.SearchRestrictions: {
        Searchable: false
    },
    Capabilities.InsertRestrictions: {
        Insertable: true,
        RequiredProperties : ['com_code', 'amt']
    },

    UI.FieldGroup #GeneratedGroup: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'mandt',
                Value: mandt,
            },
            {
                $Type: 'UI.DataField',
                Label: 'yyyymm',
                Value: yyyymm,
            },
            {
                $Type: 'UI.DataField',
                Label: 'com_code',
                Value: com_code,
            },
            {
                $Type: 'UI.DataField',
                Label: 'com_name',
                Value: com_name,
            },
            {
                $Type: 'UI.DataField',
                Label: 'account_code',
                Value: account_code,
            },
            {
                $Type: 'UI.DataField',
                Label: 'account_name',
                Value: account_name,
            },
            {
                $Type: 'UI.DataField',
                Label: 'amt',
                Value: amt,
            },
            {
                $Type: 'UI.DataField',
                Value: local_create_dtm,
            },
            {
                $Type: 'UI.DataField',
                Value: creat_user_id,
            },
            {
                $Type: 'UI.DataField',
                Value: system_create_dtm,
            }

        ],
    },
    UI.Facets                    : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Label : 'General Information',
        Target: '@UI.FieldGroup#GeneratedGroup',
    }, ],
    UI.LineItem                  : [
        {
            $Type: 'UI.DataField',
            Label: 'MANDT',
            Value: mandt,
            ![@UI.Hidden],
        },
        {
            $Type: 'UI.DataField',
            Label: '기준년월',
            Value: yyyymm,
            ![@UI.Hidden],
        },
        {
            $Type: 'UI.DataField',
            Label: '계정코드',
            Value: account_code
        },
        {
            $Type: 'UI.DataField',
            Label: '회사코드',
            Value: com_code,
        },
        {
            $Type: 'UI.DataField',
            Label: '금액',
            Value: amt,
        },
        {
            $Type: 'UI.DataField',
            Label: '로컬생성일시',
            Value: local_create_dtm,
            ![@UI.Hidden],
        },
        {
            $Type: 'UI.DataField',
            Value: create_user_id,
            ![@UI.Hidden],
        },
        {
            $Type: 'UI.DataField',
            Value: system_create_dtm,
            ![@UI.Hidden],
        },
    ],
    UI.SelectionFields : [
        com_code
    ],
    UI.SelectionPresentationVariant #table : {
        $Type : 'UI.SelectionPresentationVariantType',
        PresentationVariant : {
            $Type : 'UI.PresentationVariantType',
            Visualizations : [
                '@UI.LineItem',
            ],
        },
        SelectionVariant : {
            $Type : 'UI.SelectionVariantType',
            SelectOptions : [
            ],
        },
    }
);

annotate service.ListCompany with {
    com_code @Common.Text : com_name

};

annotate service.ListZTCD1000 with {
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
        },
        Common.ValueListWithFixedValues : true,
        Common.Label : '{i18n>Key}',
        )
};


