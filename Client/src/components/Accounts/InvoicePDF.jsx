
import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 8,
        fontFamily: 'Helvetica',
    },
    wrapper: {
        borderWidth: 1.2,
        borderColor: 'black',
    },
    header: {
        textAlign: 'center',
    },
    title: {
        fontSize: 12,
        fontWeight: 'bold',
        // textTransform: 'uppercase',
        paddingVertical: 6,
    },
    subtitle: {
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 2,
    },
    hr: {
        borderBottomWidth: 1,
        borderBottomColor: '#2d3036',
        marginVertical: 2,
    },
    companyTable: {
        flexDirection: 'row',
        marginTop: 5,
        borderWidth: 1,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderColor: '#2d3036',
    },
    companyLeft: {
        width: '50%',
        padding: 5,
        paddingVertical: 14,
        borderRightWidth: 1,
        marginTop: 0,
        borderRightColor: '#2d3036',
        lineHeight: 0.6,
    },
    companyRight: {
        width: '50%',
        padding: 5,
        lineHeight: 0.6,

    },
    billTable: {
        flexDirection: 'row',
        marginTop: 15,
        borderWidth: 1,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderColor: '#2d3036',
    },
    billLeft: {
        width: '50%',
        padding: 5,
        lineHeight: 0.6,
        borderRightWidth: 1,
        borderRightColor: '#2d3036',
    },
    billRight: {
        width: '50%',
        padding: 10,
    },
    servicesTable: {
        marginTop: 15,
        borderWidth: 1,
        borderColor: '#2d3036',
        borderBottomWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
    },
    tableRow: {
        flexDirection: 'row',
        minHeight: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#2d3036',
    },
    tableColumn: {
        borderRightWidth: 1,
        borderRightColor: '#2d3036',

    },
    tableHeader: {
        backgroundColor: '#f3f4f6',
        fontWeight: 'bold',

    },
    tableCell: {
        paddingHorizontal: 2,
        textAlign: 'center',
        paddingVertical: 4,
        flexWrap: 'wrap',
        overflow: 'hidden',
    },
    tableCellLeft: {
        paddingHorizontal: 2,
        paddingVertical: 4,
        textAlign: 'left',
        flexWrap: 'wrap',
        overflow: 'hidden',
    },
    tableCellHeader: {
        paddingHorizontal: 0,
        // paddingVertical:4,
        marginTop: 4,
        textAlign: 'center',
        flexWrap: 'wrap',
        overflow: 'hidden',
        fontSize: 7,
    },
    footerTable: {
        flexDirection: 'row',
        marginTop: 20,
        borderWidth: 1,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderColor: '#2d3036',
    },
    footerLeft: {
        width: '50%',
        padding: 5,
        borderRightWidth: 1,
        borderRightColor: '#2d3036',
    },
    footerRight: {
        width: '50%',
        padding: 10,
        textAlign: 'right',
    },
    certification: {
        borderTopWidth: 1,
        borderTopColor: '#2d3036',
        marginTop: 5,
        padding: 5,
        fontStyle: 'italic',
    },
    paymentSection: {
        padding: 10,
        paddingVertical: 15,
        width: '50%',
    },
    bold: {
        fontWeight: 'bold',
    },
    textRight: {
        textAlign: 'right',
    },
    multiLineText: {
        flexDirection: 'column',
    },
});

const InvoicePDF = ({ client, services, invoiceDate, subtotal, totalCGST, totalSGST, totalIGST, total, amountInWords }) => {
    const isUP = client?.gstin?.startsWith('09');

    const columnWidths = {
        sno: 20,
        description: 120,
        hsn: 40,
        qty: 30,
        rate: 40,
        totalValue: 50,
        taxableValue: 50,
        taxRate: 25,
        taxAmount: 35,
        totalBill:90,
    };


    const currentDate = invoiceDate || '11/08/2025';

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.wrapper}>
                    <View style={styles.header}>
                        <Text style={styles.title}>GITS Projects Pvt. Ltd.</Text>
                        <View style={styles.hr} />
                        <Text style={styles.subtitle}>TAX INVOICE</Text>
                    </View>

                    <View style={styles.companyTable}>
                        <View style={styles.companyLeft}>
                            <View style={styles.multiLineText}>
                                <Text>Suite No 101, H 44, BSI Business Park, Noida, Sector 63, Noida,</Text>
                                <Text>Gautam Buddha Nagar, Uttar Pradesh, 201301</Text>
                            </View>
                        </View>
                        <View style={styles.companyRight}>
                            <Text>GSTIN/UIN: <Text>09AAHCG0415F1ZY</Text></Text>
                            <Text>State Code: <Text>09</Text></Text>
                            <Text>CIN: <Text>U74999UP2017PTC324952</Text></Text>
                            <Text>PAN: <Text>AAHCG0415F</Text></Text>
                        </View>
                    </View>

                    <View style={styles.billTable}>
                        <View style={styles.billLeft}>
                            <Text style={styles.bold}>Bill To:</Text>
                            <Text style={styles.bold}>M/s {client?.company || 'Client Company'}</Text>
                            <Text>{client?.address || 'Client Address'}</Text>
                            <Text>GSTIN/UIN: <Text>{client?.gstin || 'N/A'}</Text></Text>
                            <Text>State Code: <Text>{client?.gstin?.substring(0, 2) || 'XX'}</Text></Text>
                        </View>
                        <View style={styles.billRight}>
                            <Text style={{ paddingVertical: 5 }}>Date: <Text>{currentDate}</Text></Text>
                            <Text>Invoice No: <Text>GITS/202526/100</Text></Text>
                        </View>
                    </View>

                    <View style={styles.servicesTable}>
                        {/* Header Row 1 */}
                        <View style={[styles.tableRow, styles.tableHeader, { borderBottomWidth: 0, }]}>
                            <View style={[styles.tableColumn, { width: columnWidths.sno }]}>
                                <Text style={[styles.tableCellHeader]}>S.No</Text>
                            </View>
                            <View style={[styles.tableColumn, { width: columnWidths.description }]}>
                                <Text style={[styles.tableCellHeader]}>Description of Services</Text>
                            </View>
                            <View style={[styles.tableColumn, { width: columnWidths.hsn }]}>
                                <Text style={[styles.tableCellHeader]}>HSN</Text>
                            </View>
                            <View style={[styles.tableColumn, { width: columnWidths.qty }]}>
                                <Text style={[styles.tableCellHeader]}>Qty (Mth)</Text>
                            </View>
                            <View style={[styles.tableColumn, { width: columnWidths.rate }]}>
                                <Text style={[styles.tableCellHeader]}>Rate</Text>
                            </View>
                            <View style={[styles.tableColumn, { width: columnWidths.totalValue }]}>
                                <Text style={[styles.tableCellHeader]}>Total Value</Text>
                            </View>
                            <View style={[styles.tableColumn, { width: columnWidths.taxableValue }]}>
                                <Text style={[styles.tableCellHeader]}>Taxable Value</Text>
                            </View>
                            {isUP ? (
                                <>
                                    <View style={[styles.tableColumn, { width: columnWidths.taxRate + columnWidths.taxAmount, borderBottomWidth: 1 }]}>
                                        <Text style={[styles.tableCellHeader]}>CGST</Text>
                                    </View>
                                    <View style={[styles.tableColumn, { width: columnWidths.taxRate + columnWidths.taxAmount, borderBottomWidth: 1 }]}>
                                        <Text style={[styles.tableCellHeader]}>SGST</Text>
                                    </View>
                                </>
                            ) : (
                                <View style={[styles.tableColumn, { width: columnWidths.taxRate + columnWidths.taxAmount, borderBottomWidth: 1 }]}>
                                    <Text style={[styles.tableCellHeader]}>IGST</Text>
                                </View>
                            )}
                            <View style={[styles.tableColumn, { width: columnWidths.totalBill, borderRightWidth: 0, }]}>
                                <Text style={[styles.tableCellHeader, { marginLeft: 5 }]}>Total Bill Value</Text>
                            </View>
                        </View>

                        {/* Header Row 2 */}
                        <View style={[styles.tableRow, styles.tableHeader,]}>
                            <View style={[styles.tableColumn, { width: columnWidths.sno }]}>
                                <Text style={[styles.tableCellHeader]}></Text>
                            </View>
                            <View style={[styles.tableColumn, { width: columnWidths.description }]}>
                                <Text style={[styles.tableCellHeader]}></Text>
                            </View>
                            <View style={[styles.tableColumn, { width: columnWidths.hsn }]}>
                                <Text style={[styles.tableCellHeader]}></Text>
                            </View>
                            <View style={[styles.tableColumn, { width: columnWidths.qty }]}>
                                <Text style={[styles.tableCellHeader]}></Text>
                            </View>
                            <View style={[styles.tableColumn, { width: columnWidths.rate }]}>
                                <Text style={[styles.tableCellHeader]}></Text>
                            </View>
                            <View style={[styles.tableColumn, { width: columnWidths.totalValue }]}>
                                <Text style={[styles.tableCellHeader]}></Text>
                            </View>
                            <View style={[styles.tableColumn, { width: columnWidths.taxableValue }]}>
                                <Text style={[styles.tableCellHeader]}></Text>
                            </View>
                            {isUP ? (
                                <>
                                    <View style={[styles.tableColumn, { width: columnWidths.taxRate }]}>
                                        <Text style={[styles.tableCellHeader]}>Rate</Text>
                                    </View>
                                    <View style={[styles.tableColumn, { width: columnWidths.taxAmount }]}>
                                        <Text style={[styles.tableCellHeader]}>Amount</Text>
                                    </View>
                                    <View style={[styles.tableColumn, { width: columnWidths.taxRate }]}>
                                        <Text style={[styles.tableCellHeader]}>Rate</Text>
                                    </View>
                                    <View style={[styles.tableColumn, { width: columnWidths.taxAmount }]}>
                                        <Text style={[styles.tableCellHeader]}>Amount</Text>
                                    </View>
                                </>
                            ) : (
                                <>
                                    <View style={[styles.tableColumn, { width: columnWidths.taxRate }]}>
                                        <Text style={[styles.tableCellHeader]}>Rate</Text>
                                    </View>
                                    <View style={[styles.tableColumn, { width: columnWidths.taxAmount }]}>
                                        <Text style={[styles.tableCellHeader]}>Amount</Text>
                                    </View>
                                </>
                            )}
                            <View style={[styles.tableColumn, { width: columnWidths.totalBill, borderRightWidth: 0 }]}>
                                <Text style={[styles.tableCellHeader]}></Text>
                            </View>
                        </View>

                        {/* Spacer Row */}

                        <View style={[styles.tableColumn, { width: columnWidths.sno }]}></View>
                        <View style={[styles.tableColumn, { width: columnWidths.description }]}></View>
                        <View style={[styles.tableColumn, { width: columnWidths.hsn }]}></View>
                        <View style={[styles.tableColumn, { width: columnWidths.qty }]}></View>
                        <View style={[styles.tableColumn, { width: columnWidths.rate }]}></View>
                        <View style={[styles.tableColumn, { width: columnWidths.totalValue }]}></View>
                        <View style={[styles.tableColumn, { width: columnWidths.taxableValue }]}></View>
                        {isUP ? (
                            <>
                                <View style={[styles.tableColumn, { width: columnWidths.taxRate + columnWidths.taxAmount }]}></View>
                                <View style={[styles.tableColumn, { width: columnWidths.taxRate + columnWidths.taxAmount }]}></View>
                            </>
                        ) : (
                            <View style={[styles.tableColumn, { width: columnWidths.taxRate + columnWidths.taxAmount }]}></View>
                        )}
                        <View style={[styles.tableColumn, { width: columnWidths.totalBill, borderRightWidth: 0, borderBottomWidth: 0 }]}></View>


                        {/* Body */}
                        {services.map((service, index) => {
                            const totalValue = service.qty * service.rate;
                            const totalBillValue = totalValue + (service.igst || (service.cgst + service.sgst) || 0);
                            return (
                                <View style={[styles.tableRow, { minHeight: 150, }]}>
                                    <View style={[styles.tableRow, { borderBottomWidth: 0 }]} key={index}>
                                        <View style={[styles.tableColumn, { width: columnWidths.sno }]}>
                                            <Text style={[styles.tableCell]}>{index + 1}</Text>
                                        </View>
                                        <View style={[styles.tableColumn, { width: columnWidths.description }]}>
                                            <Text style={[styles.tableCellLeft]}>{service.description}</Text>
                                        </View>
                                        <View style={[styles.tableColumn, { width: columnWidths.hsn }]}>
                                            <Text style={[styles.tableCell]}>{service.hsn}</Text>
                                        </View>
                                        <View style={[styles.tableColumn, { width: columnWidths.qty }]}>
                                            <Text style={[styles.tableCell]}>{service.qty}</Text>
                                        </View>
                                        <View style={[styles.tableColumn, { width: columnWidths.rate }]}>
                                            <Text style={[styles.tableCell]}>{service.rate}</Text>
                                        </View>
                                        <View style={[styles.tableColumn, { width: columnWidths.totalValue }]}>
                                            <Text style={[styles.tableCell]}>{totalValue.toFixed(2)}</Text>
                                        </View>
                                        <View style={[styles.tableColumn, { width: columnWidths.taxableValue }]}>
                                            <Text style={[styles.tableCell]}>{totalValue.toFixed(2)}</Text>
                                        </View>
                                        {isUP ? (
                                            <>
                                                <View style={[styles.tableColumn, { width: columnWidths.taxRate }]}>
                                                    <Text style={[styles.tableCell]}>9%</Text>
                                                </View>
                                                <View style={[styles.tableColumn, { width: columnWidths.taxAmount }]}>
                                                    <Text style={[styles.tableCell]}>{(service.cgst || 0).toFixed(2)}</Text>
                                                </View>
                                                <View style={[styles.tableColumn, { width: columnWidths.taxRate }]}>
                                                    <Text style={[styles.tableCell]}>9%</Text>
                                                </View>
                                                <View style={[styles.tableColumn, { width: columnWidths.taxAmount }]}>
                                                    <Text style={[styles.tableCell,]}>{(service.sgst || 0).toFixed(2)}</Text>
                                                </View>
                                            </>
                                        ) : (
                                            <>
                                                <View style={[styles.tableColumn, { width: columnWidths.taxRate }]}>
                                                    <Text style={[styles.tableCell]}>18%</Text>
                                                </View>
                                                <View style={[styles.tableColumn, { width: columnWidths.taxAmount }]}>
                                                    <Text style={[styles.tableCell]}>{(service.igst || 0).toFixed(2)}</Text>
                                                </View>
                                            </>
                                        )}
                                        <View style={[styles.tableColumn, { width: columnWidths.totalBill, borderRightWidth: 0, borderBottomWidth: 0, textAlign: '' }]}>
                                            <Text style={[styles.tableCell, { textAlign: 'center',marginLeft:5 }]}>{totalBillValue.toFixed(2)}</Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}

                        {/* Total Row */}
                        <View style={[styles.tableRow,]}>
                            <View
                                style={[
                                    styles.tableColumn,
                                    {
                                        width: columnWidths.sno + columnWidths.description + columnWidths.hsn + columnWidths.qty + columnWidths.rate,
                                        textAlign: 'right',
                                    },
                                ]}
                            >
                                <Text style={[styles.tableCell, { fontWeight: 'bold', textAlign: 'right' }]}>Total</Text>
                            </View>
                            <View style={[styles.tableColumn, { width: columnWidths.totalValue }]}>
                                <Text style={[styles.tableCell, { textAlign: 'right' }]}>{subtotal.toFixed(2)}</Text>
                            </View>
                            <View style={[styles.tableColumn, { width: columnWidths.taxableValue }]}>
                                <Text style={[styles.tableCell, { textAlign: 'right' }]}>{subtotal.toFixed(2)}</Text>
                            </View>
                            {isUP ? (
                                <>
                                    <View style={[styles.tableColumn, { width: columnWidths.taxRate }]}>
                                        <Text style={[styles.tableCell]}></Text>
                                    </View>
                                    <View style={[styles.tableColumn, { width: columnWidths.taxAmount }]}>
                                        <Text style={[styles.tableCell]}>{totalCGST.toFixed(2)}</Text>
                                    </View>
                                    <View style={[styles.tableColumn, { width: columnWidths.taxRate }]}>
                                        <Text style={[styles.tableCell]}></Text>
                                    </View>
                                    <View style={[styles.tableColumn, { width: columnWidths.taxAmount }]}>
                                        <Text style={[styles.tableCell]}>{totalSGST.toFixed(2)}</Text>
                                    </View>
                                </>
                            ) : (
                                <>
                                    <View style={[styles.tableColumn, { width: columnWidths.taxRate, textAlign: 'right' }]}>
                                        <Text style={[styles.tableCell]}></Text>
                                    </View>
                                    <View style={[styles.tableColumn, { width: columnWidths.taxAmount }]}>
                                        <Text style={[styles.tableCell, { textAlign: 'right' }]}>{totalIGST.toFixed(2)}</Text>
                                    </View>
                                </>
                            )}
                            <View style={[styles.tableColumn, { width: columnWidths.totalBill, borderRightWidth: 0, textAlign: 'right' }]}>
                                <Text style={[styles.tableCell, { textAlign: 'right',marginRight:5 }]}>{total.toFixed(2)}</Text>
                            </View>
                        </View>

                        {/* Grand Total Row */}
                        <View style={[styles.tableRow, { textAlign: 'right', }]}>
                            <View
                                style={[
                                    styles.tableColumn, { textAlign: 'right', },
                                    {
                                        width:
                                            columnWidths.sno +
                                            columnWidths.description +
                                            columnWidths.hsn +
                                            columnWidths.qty +
                                            columnWidths.rate +
                                            columnWidths.totalValue +
                                            columnWidths.taxableValue +
                                            (isUP ? (columnWidths.taxRate + columnWidths.taxAmount) * 2 : columnWidths.taxRate + columnWidths.taxAmount),
                                        textAlign: 'right',
                                    },
                                ]}
                            >
                                <Text style={[styles.tableCell, { fontWeight: 'bold', textAlign: 'right' }]}>Grand Total</Text>
                            </View>
                            <View style={[styles.tableColumn, { width: columnWidths.totalBill, borderRightWidth: 0 }]}>
                                <Text style={[styles.tableCell, { fontWeight: 'bold', textAlign: 'right',marginRight:5 }]}>{total.toFixed(2)}</Text>
                            </View>
                        </View>

                        {/* Less Advance Row */}
                        <View style={styles.tableRow}>
                            <View
                                style={[
                                    styles.tableColumn,
                                    {
                                        width:
                                            columnWidths.sno +
                                            columnWidths.description +
                                            columnWidths.hsn +
                                            columnWidths.qty +
                                            columnWidths.rate +
                                            columnWidths.totalValue +
                                            columnWidths.taxableValue +
                                            (isUP ? (columnWidths.taxRate + columnWidths.taxAmount) * 2 : columnWidths.taxRate + columnWidths.taxAmount),
                                        textAlign: 'right',
                                    },
                                ]}
                            >
                                <Text style={[styles.tableCell, { textAlign: 'right' }]}>Less Advance</Text>
                            </View>
                            <View style={[styles.tableColumn, { width: columnWidths.totalBill, borderRightWidth: 0 }]}>
                                <Text style={[styles.tableCell, { textAlign: 'right',marginRight:5 }]}>0</Text>
                            </View>
                        </View>

                        {/* Total Payment Row */}
                        <View style={styles.tableRow}>
                            <View
                                style={[
                                    styles.tableColumn,
                                    {
                                        width:
                                            columnWidths.sno +
                                            columnWidths.description +
                                            columnWidths.hsn +
                                            columnWidths.qty +
                                            columnWidths.rate +
                                            columnWidths.totalValue +
                                            columnWidths.taxableValue +
                                            (isUP ? (columnWidths.taxRate + columnWidths.taxAmount) * 2 : columnWidths.taxRate + columnWidths.taxAmount),
                                        textAlign: 'right',
                                    },
                                ]}
                            >
                                <Text style={[styles.tableCell, { fontWeight: 'bold', textAlign: 'right' }]}>Total Payment</Text>
                            </View>
                            <View style={[styles.tableColumn, { width: columnWidths.totalBill, borderRightWidth: 0, textAlign: 'right' }]}>
                                <Text style={[styles.tableCell, { fontWeight: 'bold', textAlign: 'right',marginRight:5 }]}>{total.toFixed(2)}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ padding: 4, marginBottom: -15 }}>
                        <Text>
                            Total Amount in words : {" "}
                            {amountInWords
                                .split(" ")
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(" ")}{" "}
                            Only
                        </Text>
                    </View>


                    <View style={styles.footerTable}>

                        <View style={styles.footerLeft}>
                            <Text>E.&O.E.</Text>
                            <View style={styles.certification}>
                                <Text>Certified that the particulars given above are true & correct and the amount indicated represents the price.</Text>
                            </View>
                        </View>
                        <View style={styles.footerRight}>
                            <Text><Text style={styles.bold}>For GITS Projects Pvt. Ltd.</Text></Text>
                            <Text style={{ marginTop: 10, fontWeight: 'bold' }}>Authorised Signatory</Text>
                        </View>
                    </View>
                </View>
                <View style={{ marginTop: 8, padding: 10, width: '50%', lineHeight: 0.7 }}>
                    <Text>Online Payment transfer to</Text>
                    <Text style={[styles.bold,]}>GITS Projects Pvt. Ltd.</Text>
                    <Text >A/c No. 201002187106</Text>
                    <Text >Name: GITS Projects Private Limited</Text>
                    <Text >Bank: IndusInd Bank</Text>
                    <Text >IFSC: INDB0000171</Text>
                </View>

            </Page>
        </Document>
    );
};

export default InvoicePDF;