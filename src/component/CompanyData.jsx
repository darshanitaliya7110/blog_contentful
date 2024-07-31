const CompanyData = ({ companyData }) => {
    return (
        <div>
            <h1>{companyData.companyName}</h1>
            {
                companyData?.company.map((item, i) => <p key={i}>{item}</p>)
            }
        </div>
    )
}

export default CompanyData
