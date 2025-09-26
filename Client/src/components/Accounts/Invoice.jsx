import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import AccountsNav from './AccountsNav';
import axiosInstance from '../../axiosInstance';
import InvoicePDF from './InvoicePDF';
import { PDFDownloadLink } from '@react-pdf/renderer';
import numberToWords from 'number-to-words';


const Invoice = () => {
  const { clientId } = useParams();

  const [client, setClient] = useState(null);
  const [invoiceDate, setInvoiceDate] = useState('');
  const [services, setServices] = useState([]);
  const invoiceRef = useRef();

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const res = await axiosInstance.get(`/v5/accounts/client/${clientId}`);
        const clientData = res.data;

        setClient(clientData);
        console.log('Client Data:', clientData);

        setInvoiceDate(new Date().toLocaleDateString('en-GB'));

        setServices([
          {
            description: `${clientData.serviceType}`,
            hsn: '998314',
            qty: 1,
            rate: clientData.rates,
            igst:
              clientData.gstin.startsWith('07')
                ? (clientData.rates * 18) / 100
                : 0,
            cgst:
              clientData.gstin.startsWith('09')
                ? (clientData.rates * 9) / 100
                : 0,
            sgst:
              clientData.gstin.startsWith('09')
                ? (clientData.rates * 9) / 100
                : 0,
          },
        ]);

      } catch (err) {
        console.error('Error fetching client data:', err);
      }
    };

    fetchClientData();
  }, [clientId]);



  if (!client) return <p className="text-center mt-24">Loading...</p>;

  const subtotal = services.reduce((acc, s) => acc + (s.qty * s.rate), 0);
  const totalCGST = services.reduce((acc, s) => acc + (s.cgst || 0), 0);
  const totalSGST = services.reduce((acc, s) => acc + (s.sgst || 0), 0);
  const totalIGST = services.reduce((acc, s) => acc + (s.igst || 0), 0);
  const total = subtotal + totalCGST + totalSGST + totalIGST;
  const amountInWords = numberToWords.toWords(total);



  return (
    <>
      <AccountsNav />
      <PDFDownloadLink
        document={
          <InvoicePDF
            client={client}
            services={services}
            invoiceDate={invoiceDate}
            subtotal={subtotal}
            totalCGST={totalCGST}
            totalSGST={totalSGST}
            totalIGST={totalIGST}
            total={total}
            amountInWords={amountInWords}
          />
        }
        fileName={`invoice-${client?.company}.pdf`}
      >
        {({ loading }) =>
          loading ? (
            <button className="bg-gray-400 text-white px-4 py-2 mt-22 rounded text-center">Loading PDF...</button>
          ) : (
            <button className="bg-green-600 cursor-pointer hover:bg-green-700 justify-center ml-68 text-white font-semibold py-2 mt-22 px-4 rounded">
              Download PDF
            </button>
          )
        }
      </PDFDownloadLink>
      <table ref={invoiceRef} className="border-collapse mt-6 max-w-5xl mb-15 mx-auto p-8 border-2 border-black bg-white shadow-md">
        <header className="text-center">
          <h1 className="text-xl font-bold  py-2">GITS Projects Pvt. Ltd.</h1>
          <hr />
          <h2 className="font-semibold mt-1">TAX INVOICE</h2>
          {/* <hr /> */}
        </header>

        <table className="w-full table-auto border border-l-0 border-r-0 mt-2 text-sm border-collapse">

          <tbody>
            <tr>
              <td className="border px-4 py-7  w-1/2 align-top ">
                Suite No 101, H 44, BSI Business Park, Noida, Sector 63, Noida,<br />
                Gautam Buddha Nagar, Uttar Pradesh, 201301
              </td>
              <td className="border px-4 py-2 w-1/2 align-top">
                <div className="mb-1">GSTIN/UIN: <span>09AAHCG0415F1ZY</span></div>
                <div className="mb-1">State Code: <span>09</span></div>
                <div className="mb-1">CIN: <span>U74999UP2017PTC324952</span></div>
                <div className="mb-1">PAN: <span>AAHCG0415F</span></div>
              </td>
            </tr>
          </tbody>
        </table>


        <table className="w-full table-auto border border-gray-400 border-l-0 border-r-0 mt-6 text-sm border-collapse">
          <tbody>
            <tr>
              <td className="border px-4 py-2 w-1/2 align-top">
                <p className="font-semibold mb-1">Bill To:</p>
                <strong><p >M/s {client?.company || 'Client Company'}</p></strong>
                <p>{client?.address || 'Client Address'}</p>
                <p>GSTIN/UIN: <span>{client?.gstin || 'N/A'}</span></p>
                <p>State Code: <span>{client?.gstin?.substring(0, 2) || 'XX'}</span></p>
              </td>
              <td className="border px-4 py-2 w-1/2 align-top">
                <p>Date: <strong>{invoiceDate}</strong></p>
                <p className="mt-2">Invoice No: <strong>GITS/202526/100</strong></p>
              </td>
            </tr>
          </tbody>
        </table>


        {/* <hr className="my-6 border-gray-500 w-full border-t border" /> */}

        <section className="mt-6 overflow-x-auto">
          <table className="w-full border border-gray-400 border-l-0 border-r-0 text-sm text-left border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1" rowSpan={2}>S.No</th>
                <th className="border px-2 py-1" rowSpan={2}>Description of Services</th>
                <th className="border px-2 py-1" rowSpan={2}>HSN</th>
                <th className="border px-2 py-1" rowSpan={2}>Qty (Months)</th>
                <th className="border px-2 py-1" rowSpan={2}>Rate</th>
                <th className="border px-2 py-1" rowSpan={2}>Total Value</th>
                <th className="border px-2 py-1" rowSpan={2}>Taxable Value</th>
                {client?.gstin?.startsWith('09') ? (
                  <>
                    <th className="border px-2 py-1 text-center" colSpan={2}>CGST</th>
                    <th className="border px-2 py-1 text-center" colSpan={2}>SGST</th>
                  </>
                ) : (
                  <th className="border px-2 py-1 text-center" colSpan={2}>IGST</th>
                )}

                <th className="border px-2 py-1" rowSpan={2}>Total Bill Value</th>
              </tr>
              <tr>
                {client?.gstin?.startsWith('09') ? (
                  <>
                    <th className="border px-2 py-1 text-center">Rate</th>
                    <th className="border px-2 py-1 text-center">Amount</th>
                    <th className="border px-2 py-1 text-center">Rate</th>
                    <th className="border px-2 py-1 text-center">Amount</th>
                  </>
                ) : (
                  <>
                    <th className="border px-2 py-1 text-center">Rate</th>
                    <th className="border px-2 py-1 text-center">Amount</th>
                  </>
                )}

              </tr>
            </thead>
            <tbody>
              {services.map((service, index) => {
                const totalValue = service.qty * service.rate;
                const totalBillValue = totalValue + service.igst;
                return (
                  <tr key={index}>
                    <td className="border px-2 py-1 text-center">{index + 1}</td>
                    <td className="border px-2 py-1">{service.description}</td>
                    <td className="border px-2 py-1 text-center">{service.hsn}</td>
                    <td className="border px-2 py-1 text-center">{service.qty}</td>
                    <td className="border px-2 py-1 text-center">{service.rate}</td>
                    <td className="border px-2 py-1 text-center">{totalValue.toFixed(2)}</td>
                    <td className="border px-2 py-1 text-center">{totalValue.toFixed(2)}</td>
                    {client?.gstin?.startsWith('09') ? (
                      <>
                        <td className="border px-2 py-1 text-center">9%</td>
                        <td className="border px-2 py-1 text-center">{(service.cgst || 0).toFixed(2)}</td>
                        <td className="border px-2 py-1 text-center">9%</td>
                        <td className="border px-2 py-1 text-center">{(service.sgst || 0).toFixed(2)}</td>
                      </>
                    ) : (
                      <>
                        <td className="border px-2 py-1 text-center">18%</td>
                        <td className="border px-2 py-1 text-center">{(service.igst || 0).toFixed(2)}</td>
                      </>
                    )}

                    <td className="border px-2 py-1 text-center">{totalBillValue.toFixed(2)}</td>
                  </tr>
                );
              })}

              {/* <tr><td colSpan="10" className="py-4"></td></tr> */}
              <tr>
                <td colSpan="5" className="border px-2 py-5 text-right font-semibold">Total</td>
                <td className="border px-2 py-1 text-center">{subtotal.toFixed(2)}</td>
                <td className="border px-2 py-1 text-center">{subtotal.toFixed(2)}</td>

                {/* GST Columns */}
                {client?.gstin?.startsWith('09') ? (
                  <>
                    <td className="border px-2 py-1 text-center"></td>
                    <td className="border px-2 py-1 text-center">{totalCGST.toFixed(2)}</td>
                    <td className="border px-2 py-1 text-center"></td>
                    <td className="border px-2 py-1 text-center">{totalSGST.toFixed(2)}</td>
                  </>
                ) : (
                  <>
                    <td className="border px-2 py-1 text-center"></td>
                    <td className="border px-2 py-1 text-center">{totalIGST.toFixed(2)}</td>
                    {/* <td className="border px-2 py-1 text-center"></td> */}
                    {/* <td className="border px-2 py-1 text-center"></td> */}
                  </>
                )}

                <td className="border px-2 py-1 text-center">{total.toFixed(2)}</td>
              </tr>


              <tr>
                <td
                  colSpan={client?.gstin?.startsWith("09") ? 11 : 9}
                  className="border px-2 py-1 text-right font-semibold"
                >
                  Grand Total
                </td>
                <td className="border px-2 py-1 text-center font-semibold">{total.toFixed(2)}</td>
              </tr>

              <tr>
                <td
                  colSpan={client?.gstin?.startsWith("09") ? 11 : 9}
                  className="border px-2 py-1 text-right"
                >
                  Less Advance
                </td>
                <td className="border px-2 py-1 text-center">0</td>
              </tr>

              <tr>
                <td
                  colSpan={client?.gstin?.startsWith("09") ? 11 : 9}
                  className="border px-2 py-1 text-right font-bold"
                >
                  Total Payment
                </td>
                <td className="border px-2 py-1 text-center font-bold">{total.toFixed(2)}</td>
              </tr>
              <tr className="w-full">
                <td colSpan={12} className="border px-2 py-1 w-full ">
                  Total Amount in words - {amountInWords.charAt(0).toUpperCase() + amountInWords.slice(1)} only
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <table className="w-full table-auto border border-l-0 border-r-0 mt-8 text-xs border-collapse">
          <tbody>
            <tr>
              {/* Left Side (50%) */}
              <td className="border w-1/2 align-top p-2">
                <div>E.&O.E.</div>
                <div className="border-t-1 mt-1 px-4 py-2 italic">
                  Certified that the particulars given above are true & correct and the amount indicated represents the price.
                </div>
              </td>

              {/* Right Side (50%) */}
              <td className="border w-1/4 text-right align-top px-4 py-6">
                <p><strong>For GITS Projects Pvt. Ltd.</strong></p>
                <p className="py-4 font-semibold">Authorised Signatory</p>
              </td>
            </tr>
          </tbody>
        </table>

      </table>
      <div className='ml-60 -mt-10 mb-10'>
        <tr>
          <td className=" px-4  w-1/2 align-top ml-30">
            <p>Online Payment transfer to</p>
            <p className="font-bold">GITS Projects Pvt. Ltd.</p>
            <p>A/c No. 201002187106</p>
            <p>Name: GITS Projects Private Limited</p>
            <p>Bank: IndusInd Bank</p>
            <p>IFSC: INDB0000171</p>
          </td>

        </tr>
      </div>
    </>
  );
};

export default Invoice;
