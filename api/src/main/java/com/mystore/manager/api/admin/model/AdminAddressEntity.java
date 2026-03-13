package com.mystore.manager.api.admin.model;

import com.mystore.manager.api.admin.util.AdminConstants;
import com.mystore.manager.api.common.model.AbstractUserDateAudit;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import javax.xml.bind.annotation.XmlRootElement;

@Entity
@Table(schema = AdminConstants.ADMIN_SCH, name = AdminConstants.ADDRESS_TABLE)
@XmlRootElement
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class AdminAddressEntity extends AbstractUserDateAudit {
    private static final long serialVersionUID = 1L;

    @Id
    @Basic(optional = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    private String address;
    private String city;
    private String town;
    private String country;
    private String postalCode;
    private double latitude;
    private double longitude;
}
