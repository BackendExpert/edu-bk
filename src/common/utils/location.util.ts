import axios from "axios";
import { Request } from "express";

export function getClientIp(req: Request): string {
    if (process.env.NODE_ENV === "development") {
        return "127.0.0.1";
    }

    const forwarded = req.headers["x-forwarded-for"];

    if (typeof forwarded === "string") {
        return forwarded.split(",")[0].trim();
    }

    if (Array.isArray(forwarded)) {
        return forwarded[0];
    }

    return req.ip || req.socket.remoteAddress || "";
}

export async function getLocationFromIp(req: Request) {
    try {
        const ipAddress = getClientIp(req);
        const ip = ipAddress.replace("::ffff:", "");

        const response = await axios.get(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp`);

        if (response.data.status !== "success") {
            return null;
        }

        return {
            ip,
            country: response.data.country,
            countryCode: response.data.countryCode,
            region: response.data.region,
            regionName: response.data.regionName,
            city: response.data.city,
            postalCode: response.data.zip,
            latitude: response.data.lat,
            longitude: response.data.lon,
            timezone: response.data.timezone,
            isp: response.data.isp,
        };
    } catch {
        return null;
    }
}