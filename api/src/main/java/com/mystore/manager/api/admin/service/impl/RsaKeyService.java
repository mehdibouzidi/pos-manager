package com.mystore.manager.api.admin.service.impl;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.OAEPParameterSpec;
import javax.crypto.spec.PSource;
import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.spec.MGF1ParameterSpec;
import java.util.Base64;

@Service
public class RsaKeyService {

    private KeyPair keyPair;

    @PostConstruct
    public void init() throws NoSuchAlgorithmException {
        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
        keyPairGenerator.initialize(2048);
        this.keyPair = keyPairGenerator.generateKeyPair();
    }

    /**
     * Returns the RSA public key in Base64-encoded SPKI format,
     * suitable for use with the Web Crypto API on the frontend.
     */
    public String getPublicKeyBase64() {
        return Base64.getEncoder().encodeToString(keyPair.getPublic().getEncoded());
    }

    /**
     * Decrypts a Base64-encoded RSA-OAEP (SHA-256) ciphertext.
     *
     * @param encryptedBase64 the Base64-encoded encrypted payload from the frontend
     * @return the decrypted plaintext password
     */
    public String decrypt(String encryptedBase64) throws Exception {
        byte[] encryptedBytes = Base64.getDecoder().decode(encryptedBase64);
        // Use OAEPParameterSpec to explicitly set SHA-256 for MGF1,
        // matching Web Crypto API which uses the same hash for both OAEP and MGF1.
        Cipher cipher = Cipher.getInstance("RSA/ECB/OAEPPadding");
        OAEPParameterSpec spec = new OAEPParameterSpec(
                "SHA-256", "MGF1", MGF1ParameterSpec.SHA256, PSource.PSpecified.DEFAULT);
        cipher.init(Cipher.DECRYPT_MODE, keyPair.getPrivate(), spec);
        return new String(cipher.doFinal(encryptedBytes), StandardCharsets.UTF_8);
    }
}
